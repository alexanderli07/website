import { profile } from "../data/content";
import { SocialLinks } from "./Social";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {profile.name} — built from scratch, two worlds and all.</span>
        <div className="footer-right">
          <SocialLinks className="footer-social" />
          <span>{profile.location}</span>
        </div>
      </div>
    </footer>
  );
}
