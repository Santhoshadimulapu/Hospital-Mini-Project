export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} MedQueue — Hospital Appointment & Queue System</p>
        <p>Built with React &amp; Spring Boot</p>
      </div>
    </footer>
  );
}
