package com.hospital.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.hospital.dto.SymptomRecommendationRequest;
import com.hospital.dto.SymptomRecommendationResponse;
import com.hospital.entity.Doctor;
import com.hospital.repository.DoctorRepository;

@Service
public class SymptomRecommendationService {

    private static final String GENERAL_MEDICINE = "General Medicine";

    private final DoctorRepository doctorRepository;
    private final GptSymptomService gptSymptomService;

    public SymptomRecommendationService(DoctorRepository doctorRepository, GptSymptomService gptSymptomService) {
        this.doctorRepository = doctorRepository;
        this.gptSymptomService = gptSymptomService;
    }

    public SymptomRecommendationResponse recommendDoctors(SymptomRecommendationRequest request) {
        String symptomsText = request.getSymptoms() == null ? "" : request.getSymptoms().trim();
        String normalizedCity = request.getCity() == null ? "" : request.getCity().trim().toLowerCase(Locale.ROOT);

        GptSymptomService.GptAnalysisResult gptResult = gptSymptomService.analyseSymptoms(symptomsText, request.getCity());

        Map<String, Integer> scores = new LinkedHashMap<>();
        int baseScore = gptResult.getSpecializations().size() * 10;
        for (String spec : gptResult.getSpecializations()) {
            scores.put(spec, baseScore);
            baseScore -= 10;
        }

        List<SymptomRecommendationResponse.SpecializationMatch> specializationMatches = scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(e -> new SymptomRecommendationResponse.SpecializationMatch(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Set<String> topSpecializations = specializationMatches.stream()
                .map(SymptomRecommendationResponse.SpecializationMatch::getSpecialization)
                .collect(Collectors.toSet());

        List<SymptomRecommendationResponse.DoctorSuggestion> suggestions = doctorRepository.findAll().stream()
                .map(d -> mapDoctorSuggestion(d, topSpecializations, scores, normalizedCity))
                .filter(d -> d.getMatchScore() > 0)
                .sorted(Comparator.comparingInt(SymptomRecommendationResponse.DoctorSuggestion::getMatchScore).reversed())
                .limit(6)
                .collect(Collectors.toList());

        if (suggestions.isEmpty()) {
            suggestions = doctorRepository.findAll().stream()
                    .limit(6)
                    .map(d -> mapDoctorSuggestion(d, topSpecializations, scores, normalizedCity))
                    .collect(Collectors.toList());
        }

        SymptomRecommendationResponse response = new SymptomRecommendationResponse();
        response.setSymptoms(symptomsText);
        response.setCity(request.getCity());
        response.setSpecializationMatches(specializationMatches);
        response.setDoctorSuggestions(suggestions);
        response.setEmergencyFlag(gptResult.isEmergency());
        response.setEmergencyMessage(gptResult.isEmergency()
                ? "Your symptoms may need urgent care. Please contact emergency services or visit the nearest emergency room immediately."
                : null);
        response.setDisclaimer("This AI suggestion is not a diagnosis. Any medication suggestion must be verified by a qualified doctor before use.");
        response.setAiProvider("Hugging Face");
        response.setAiReasoning(gptResult.getReasoning());
        response.setUrgencyLevel(gptResult.getUrgency());
        response.setSymptomSummary(gptResult.getSymptomSummary());
        response.setPrecautions(gptResult.getPrecautions());
        response.setMedicationSuggestions(gptResult.getMedicationSuggestions().stream()
            .map(m -> new SymptomRecommendationResponse.MedicationSuggestion(
                m.getName(),
                m.getPurpose(),
                m.getPrecautions()))
            .collect(Collectors.toList()));

        return response;
    }

    private SymptomRecommendationResponse.DoctorSuggestion mapDoctorSuggestion(
            Doctor doctor,
            Set<String> topSpecializations,
            Map<String, Integer> scores,
            String normalizedCity) {

        SymptomRecommendationResponse.DoctorSuggestion suggestion = new SymptomRecommendationResponse.DoctorSuggestion();
        suggestion.setDoctorId(doctor.getId());
        suggestion.setDoctorName(doctor.getName());
        suggestion.setSpecialization(doctor.getSpecialization());
        suggestion.setConsultationTime(doctor.getConsultationTime());
        suggestion.setHospitalId(doctor.getHospital() != null ? doctor.getHospital().getId() : null);
        suggestion.setHospitalName(doctor.getHospital() != null ? doctor.getHospital().getName() : null);
        suggestion.setHospitalCity(doctor.getHospital() != null ? doctor.getHospital().getCity() : null);

        int matchScore = 0;
        String doctorSpecialization = doctor.getSpecialization() == null ? "" : doctor.getSpecialization();

        for (String top : topSpecializations) {
            if (doctorSpecialization.equalsIgnoreCase(top)) {
                matchScore += 80 + scores.getOrDefault(top, 1) * 5;
                break;
            }
            if (doctorSpecialization.toLowerCase(Locale.ROOT).contains(top.toLowerCase(Locale.ROOT))
                    || top.toLowerCase(Locale.ROOT).contains(doctorSpecialization.toLowerCase(Locale.ROOT))) {
                matchScore += 50;
                break;
            }
        }

        if (!normalizedCity.isBlank() && suggestion.getHospitalCity() != null
                && suggestion.getHospitalCity().toLowerCase(Locale.ROOT).contains(normalizedCity)) {
            matchScore += 20;
        }

        if (matchScore == 0 && topSpecializations.contains(GENERAL_MEDICINE)) {
            matchScore = 30;
        }

        suggestion.setMatchScore(matchScore);
        return suggestion;
    }

}
