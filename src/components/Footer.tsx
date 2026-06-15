import { profile } from "../data/content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {profile.name} — built from scratch, two worlds and all.
        </span>
        <span>{profile.location}</span>
      </div>
    </footer>
  );
}
