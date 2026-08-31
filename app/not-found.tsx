import shell from "@/app/shell.module.css";

export default function NotFound() {
  return (
    <div className={shell.inner}>
      <h1>Not found</h1>
      <p>That page does not exist.</p>
    </div>
  );
}
