import styles from "./panel.module.css";

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
