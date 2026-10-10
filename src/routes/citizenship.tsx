import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, Margin, PageIntro } from "@/components/site/Chrome";
import { Faq, meta } from "@/components/site/TextPage";

export const Route = createFileRoute("/citizenship")({
  head: () => meta("Citizenship by investment guidance", "Carefully qualified guidance on Turkish citizenship through property investment. Eligibility is decided by authorities and needs current legal review."),
  component: Citizenship,
});

function Citizenship() {
  return (
    <>
      <PageIntro eyebrow="Official rules apply · Guidance is not eligibility" title={<>Turkish citizenship through property: <em>clarity first.</em></>}>
        <p>Turkish authorities set and change the requirements. We help you prepare the right questions and documents, and coordinate with independent lawyers who confirm current rules for your case.</p>
      </PageIntro>
      <Margin label="Important">
        <p className="border-l-2 border-brass bg-card p-5 text-sm">No property on this website is certified as qualifying for citizenship. Developer material may mention citizenship; that does not establish eligibility. Approval rests entirely with government authorities.</p>
      </Margin>
      <Margin label="Questions buyers ask">
        <Faq items={[
          ["What is the minimum investment?", "Thresholds are set by regulation and have changed over time. A qualified Turkish lawyer should confirm the current amount and conditions before you choose a property."],
          ["How do I check whether a property is eligible?", "Eligibility depends on valuation, title and payment documentation reviewed under current rules. We coordinate these checks with independent professionals."],
          ["Can my family be included?", "Family inclusion depends on current rules and each family member's circumstances. We prepare your questions for a qualified adviser."],
          ["Can I buy remotely?", "Many steps can be coordinated remotely via power of attorney and translated documents. Which steps require presence is confirmed case by case."],
          ["Does Türkiye allow dual nationality?", "This depends on Turkish law and the law of your current country. Please seek legal advice in both jurisdictions."],
          ["Who handles rental income administration?", "We can introduce management partners; tax treatment should be confirmed with a qualified tax adviser."],
          ["What languages do you support?", "Our team works in English; ask us about other languages for your consultation."],
        ]} />
      </Margin>
      <div className="container-site pb-14"><Link to="/contact" className="btn btn-primary">Discuss your situation</Link></div>
      <CtaBand />
    </>
  );
}
