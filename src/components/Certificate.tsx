import { jsPDF } from "jspdf";

interface CertificateProps {
  userName: string;
  score: number;
}

const CertificateGenerator = ({ userName, score }: CertificateProps) => {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // --- Design du Certificat ---
    // Bordure
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190); 
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(45, 62, 80); // Un bleu sombre pro
    doc.text("CERTIFICATE OF COMPLETION", 148.5, 60, { align: "center" });

    // Texte secondaire
    doc.setFontSize(20);
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", 148.5, 85, { align: "center" });

    // Nom de l'étudiant (Hajar, Asmaa, etc.)
    doc.setFontSize(35);
    doc.setFont("times", "italic");
    doc.setTextColor(22, 160, 133); // Un vert émeraude
    doc.text(userName||"Student",148.5, 105, { align: "center" });

    // Description du succès
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 62, 80);
    doc.text(
      `has successfully completed the Linux Terminal Mastery Quiz`,
      148.5,
      130,
      { align: "center" }
    );

    // Score
    doc.setFont("helvetica", "bold");
    doc.text(`Final Score: ${score}%`, 148.5, 145, { align: "center" });

    // Pied de page / Date
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.setFontSize(12);
    doc.text(`Issued by TermiLearn on ${date}`, 148.5, 175, { align: "center" });

    // Téléchargement
    doc.save(`Certificate_${userName}_TermiLearn.pdf`);
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4">Congratulations!</h3>
      <button
        onClick={generatePDF}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
      >
        Download My Certificate (PDF)
      </button>
    </div>
  );
};

export default CertificateGenerator;