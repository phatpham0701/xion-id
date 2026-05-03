import { Sparkles } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/40">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <Wordmark className="font-display text-sm font-semibold" />
            <span className="text-xs text-muted-foreground ml-2">
              · Verified identity and rewards passport.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="https://xion.burnt.com/" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Built on XION
            </a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
