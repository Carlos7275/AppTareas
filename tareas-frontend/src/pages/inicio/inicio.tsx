import React from "react";
import styles from "./inicio.module.css";
import { titleService } from "../../main";

const Inicio: React.FC = () => {
  titleService.setTitle("Inicio");
  const imagenFondo = "images/tareas.jpeg";

  return (
    <div>
      <div
        className={`${styles.heroSection}`}
        style={{ backgroundImage: `url(${imagenFondo})` }}
      >
        <div className={styles.overlay}></div>
        <div className={`${styles.heroText}`}>
          <h1>Organiza tu vida con TodoList</h1>
          <p>
            Planifica tus días, gestiona tus tareas y alcanza tus metas sin estrés. TodoList te acompaña en cada paso de tu productividad.
          </p>
          <div className={styles.heroHighlights}>
            <div className={styles.highlight}>📋 Listas Inteligentes</div>
            <div className={styles.highlight}>⏰ Recordatorios Automáticos</div>
            <div className={styles.highlight}>📊 Estadísticas de Progreso</div>
            <div className={styles.highlight}>💻 Multiplataforma</div>
            <div className={styles.highlight}>🔔 Notificaciones en Tiempo Real</div>
          </div>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h2>Características Destacadas</h2>
        <p>
          TodoList combina simplicidad y eficacia. Mejora tu productividad con herramientas inteligentes y recordatorios intuitivos.
        </p>
        <div className={styles.infoCards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📋</div>
            <h3>Listas Inteligentes</h3>
            <p>
              Organiza tus tareas por prioridad y crea listas personalizadas para cada proyecto o actividad.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⏰</div>
            <h3>Recordatorios</h3>
            <p>
              Recibe alertas oportunas para no olvidar tareas importantes, con recordatorios recurrentes.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <h3>Estadísticas</h3>
            <p>
              Visualiza tu progreso, identifica áreas de mejora y ajusta tus hábitos con gráficos claros.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💡</div>
            <h3>Consejos de Productividad</h3>
            <p>
              Recibe tips prácticos para administrar tu tiempo y cumplir tus objetivos diarios.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💻</div>
            <h3>Multiplataforma</h3>
            <p>
              Accede a tus tareas desde cualquier dispositivo y sincroniza los cambios en tiempo real.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🔔</div>
            <h3>Notificaciones en Tiempo Real</h3>
            <p>
              Mantente informado sobre tareas próximas y cambios importantes de manera inmediata.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📥</div>
            <h3>Exportación de Datos</h3>
            <p>
              Descarga reportes de tus tareas en Excel o PDF para análisis y seguimiento personal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
