import "./footer.css";
import packageJson from "../../../package.json";

export default function Footer() {
  const version = packageJson.version;
  return (
    <>
      <footer className="footer mt-auto py-3 shadow bg-body text-body">
        <div className="container text-center">
          TodoList &copy; 2025. Todos los Derechos Reservados. Versión:
          {version}
        </div>
      </footer>
    </>
  );
}
