import React from "react";
import styles from "./inicio.module.css";

const Inicio: React.FC = () => {
  const imagenFondo = "images/tareas.jpeg";

  return (
    <div>
      {/* Hero Section */}
      <div
        className={`${styles.heroSection}`}
        style={{ backgroundImage: `url(${imagenFondo})` }}
      >
        <div className={styles.overlay}></div>
        <div className={`${styles.heroText}` }>
          <h1>Organiza tu vida con TodoList</h1>
          <p>
            Planifica tus días, gestiona tus tareas y alcanza tus metas sin estrés. 
            TodoList te acompaña en cada paso de tu productividad.
          </p>
          <div className={styles.heroHighlights}>
            <div className={styles.highlight}>📋 Listas Inteligentes</div>
            <div className={styles.highlight}>⏰ Recordatorios Automáticos</div>
            <div className={styles.highlight}>📊 Estadísticas de Progreso</div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <h2>Características Destacadas</h2>
        <p>
          TodoList combina simplicidad y eficacia. Descubre cómo tu productividad puede mejorar
          con herramientas inteligentes y recordatorios intuitivos.
        </p>
        <div className={styles.infoCards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📋</div>
            <h3>Listas Inteligentes</h3>
            <p>Crea listas personalizadas y organiza tus tareas por prioridad.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>⏰</div>
            <h3>Recordatorios</h3>
            <p>No pierdas de vista tus tareas importantes con alertas oportunas.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <h3>Estadísticas</h3>
            <p>Visualiza tu progreso y mejora tu productividad con gráficos claros.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💡</div>
            <h3>Consejos de Productividad</h3>
            <p>Recibe tips para administrar tu tiempo y cumplir tus objetivos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
