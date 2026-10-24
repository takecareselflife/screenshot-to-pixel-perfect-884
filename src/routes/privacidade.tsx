import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacy and data protection | Cuida+" },
      { name: "description", content: "How we protect your data, in line with the LGPD and the ECA." },
      { property: "og:title", content: "Privacy | Cuida+" },
      { property: "og:description", content: "Transparency about data, confidentiality and your rights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

const items = [
  ["Minimum collection", "We only ask for what is necessary. You can use the library, the assistant and the questionnaires without identifying yourself."],
  ["Privacy by default", "Questionnaires and chats with the assistant are not saved in this version."],
  ["Your data is never sold", "We don't use data for advertising or behavioral profiles."],
  ["No automatic sharing", "Nothing is sent to family, school or third parties automatically. Any sharing follows the law and protection protocols."],
  ["Limits of confidentiality", "Professionals respect confidentiality, but in situations of serious risk the law (ECA) may require them to activate the protection network."],
  ["Security", "In the real version: encryption, role-based access control, administrative access logs and separation between identifiable data and indicators."],
  ["Retention and deletion", "Request data will be kept only as long as necessary. You will be able to ask for deletion."],
  ["Incidents", "In case of a security incident, we will follow LGPD procedures, including notifying the ANPD when applicable."],
];

function Privacidade() {
  return (
    <div>
      <PageTitle title="Privacy and data protection" subtitle="Based on: LGPD (Law 13.709/2018), ECA (Law 8.069/1990) and professional standards." />
      <dl className="space-y-3">
        {items.map(([t, d]) => (
          <div key={t} className="card-base p-4"><dt className="font-bold">{t}</dt><dd className="mt-1 text-muted-foreground">{d}</dd></div>
        ))}
      </dl>
      <section className="mt-6 rounded-2xl bg-lilac p-4 text-lilac-foreground">
        <h2 className="text-lg font-semibold">What is real and what is simulated</h2>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Real: national numbers (190, 192, 188, Disque 100) open the call on your phone.</li>
          <li>Simulated: services directory, assistant, support requests and professionals' panel.</li>
          <li>No integration with external health systems is active.</li>
        </ul>
      </section>
    </div>
  );
}
