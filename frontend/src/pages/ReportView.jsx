import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaDownload, FaFileAlt } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTime } from '../utils/helpers';

export default function ReportView() {
  const { appointmentId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [appointmentId]);

  const fetchReport = async () => {
    try {
      const res = await reportService.getByAppointment(appointmentId);
      setReport(res.data.data);
    } catch {
      toast.error('Failed to load medical report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Colors
    const primaryGreen = [46, 125, 50];
    const darkText = [33, 33, 33];
    const mutedText = [120, 120, 120];
    const lineColor = [200, 200, 200];

    // ========== HEADER ==========
    // Hospital Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    const hospitalName = report.hospitalName || 'Hospital';
    doc.text(hospitalName, pageWidth / 2, y, { align: 'center' });
    y += 7;

    // Hospital Address
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    const hospitalAddr = report.hospitalAddress || '';
    doc.text(hospitalAddr, pageWidth / 2, y, { align: 'center' });
    y += 6;

    // Horizontal line
    doc.setDrawColor(...primaryGreen);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // MEDICAL REPORT title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text('MEDICAL REPORT', pageWidth / 2, y, { align: 'center' });
    y += 14;

    // ========== VISIT INFO ==========
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Visit Info', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(...darkText);

    // Row 1: Doctor's Name & Visit Date
    doc.setFont('helvetica', 'bold');
    doc.text("Doctor's Name:", margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text("Dr. " + report.doctorName, margin + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Visit Date:', pageWidth / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(report.appointmentDate), pageWidth / 2 + 35, y);
    y += 6;

    // Row 2: Specialization
    doc.setFont('helvetica', 'bold');
    doc.text('Specialization:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(report.specialization || '', margin + 35, y);
    y += 12;

    // ========== PATIENT INFO ==========
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Patient Info', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(...darkText);

    // Row 1: Full Name & Birth Date / Age
    doc.setFont('helvetica', 'bold');
    doc.text('Full Name:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(report.patientName || '', margin + 30, y);

    if (report.patientAge) {
      doc.setFont('helvetica', 'bold');
      doc.text('Age:', pageWidth / 2 + 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(report.patientAge), pageWidth / 2 + 25, y);
    }
    y += 6;

    // Row 2: Gender & Blood Group
    if (report.patientGender) {
      doc.setFont('helvetica', 'bold');
      doc.text('Gender:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(report.patientGender, margin + 30, y);
    }

    if (report.patientBloodGroup) {
      doc.setFont('helvetica', 'bold');
      doc.text('Blood Group:', pageWidth / 2 + 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(report.patientBloodGroup, pageWidth / 2 + 38, y);
    }
    y += 6;

    // Row 3: Phone & Email
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(report.patientPhone || '', margin + 30, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', pageWidth / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(report.patientEmail || '', pageWidth / 2 + 25, y);
    y += 14;

    // ========== ASSESSMENT ==========
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Assessment', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const assessmentLines = doc.splitTextToSize(report.assessment || '', contentWidth);
    doc.text(assessmentLines, margin, y);
    y += assessmentLines.length * 5 + 8;

    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // ========== DIAGNOSIS ==========
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Diagnosis', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const diagnosisLines = doc.splitTextToSize(report.diagnosis || '', contentWidth);
    doc.text(diagnosisLines, margin, y);
    y += diagnosisLines.length * 5 + 8;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // ========== PRESCRIPTION ==========
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Prescription', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkText);
    const prescriptionLines = doc.splitTextToSize(report.prescription || '', contentWidth);
    doc.text(prescriptionLines, margin, y);
    y += prescriptionLines.length * 5 + 20;

    // ========== FOOTER ==========
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text('For inquiries and appointments, feel free to contact us.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(
      `phone: ${report.hospitalPhone || 'N/A'}  |  ${hospitalName}`,
      pageWidth / 2, footerY + 4, { align: 'center' }
    );

    // Save with patient name
    const sanitized = (report.patientName || 'Patient').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    doc.save(`Medical_Report_${sanitized}.pdf`);
  };

  if (loading) return <LoadingSpinner />;

  if (!report) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <FaFileAlt size={48} />
            <h3>No report found for this appointment</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1><FaFileAlt style={{ marginRight: 10 }} />Medical Report</h1>
            <p>Report for appointment on {formatDate(report.appointmentDate)}</p>
          </div>
          <button className="btn btn-primary" onClick={generatePDF}>
            <FaDownload style={{ marginRight: 8 }} /> Download PDF
          </button>
        </div>

        {/* Hospital Header */}
        <div className="card" style={{ padding: 24, marginBottom: 20, textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: 22 }}>{report.hospitalName || 'Hospital'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>{report.hospitalAddress || ''}</p>
          <h3 style={{ margin: '16px 0 0', fontSize: 18, letterSpacing: 2 }}>MEDICAL REPORT</h3>
        </div>

        {/* Visit Info */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 12 }}>Visit Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Doctor's Name</span>
              <div style={{ fontWeight: 500 }}>Dr. {report.doctorName}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visit Date</span>
              <div style={{ fontWeight: 500 }}>{formatDate(report.appointmentDate)}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Specialization</span>
              <div style={{ fontWeight: 500 }}>{report.specialization}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time</span>
              <div style={{ fontWeight: 500 }}>{formatTime(report.slotTime)}</div>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 12 }}>Patient Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full Name</span>
              <div style={{ fontWeight: 500 }}>{report.patientName}</div>
            </div>
            {report.patientAge && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Age</span>
                <div style={{ fontWeight: 500 }}>{report.patientAge}</div>
              </div>
            )}
            {report.patientGender && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gender</span>
                <div style={{ fontWeight: 500 }}>{report.patientGender}</div>
              </div>
            )}
            {report.patientBloodGroup && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Blood Group</span>
                <div style={{ fontWeight: 500 }}>{report.patientBloodGroup}</div>
              </div>
            )}
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Phone</span>
              <div style={{ fontWeight: 500 }}>{report.patientPhone}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email</span>
              <div style={{ fontWeight: 500 }}>{report.patientEmail}</div>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 10 }}>Assessment</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{report.assessment}</p>
        </div>

        {/* Diagnosis */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 10 }}>Diagnosis</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{report.diagnosis}</p>
        </div>

        {/* Prescription */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, color: 'var(--primary)', marginBottom: 10 }}>Prescription</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{report.prescription}</p>
        </div>

        {/* Footer Info */}
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          <p>For inquiries and appointments, feel free to contact us.</p>
          <p>phone: {report.hospitalPhone || 'N/A'} | {report.hospitalName || ''}</p>
        </div>
      </div>
    </div>
  );
}
