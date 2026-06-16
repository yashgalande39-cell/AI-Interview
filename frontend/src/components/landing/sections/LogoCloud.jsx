import { Reveal } from "../fx/Reveal";

const logos = ["Google", "Microsoft", "Amazon", "Tesla", "Meta", "Adobe", "Infosys", "Netflix", "Stripe", "Nvidia"];

export function LogoCloud() {
  const row = [...logos, ...logos];
  return (
    <section className="lp-logo-cloud">
      <Reveal className="lp-logo-cloud-label">
        Graduates hired at the world's most ambitious companies
      </Reveal>
      <div className="lp-marquee-wrapper">
        <div className="lp-marquee-track">
          {row.map((l, i) => (
            <span key={i} className="lp-marquee-item">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
