import PDFDropzone from "@/components/PDFDropzone";
import ReceiptList from "@/components/ReceiptList";

function Home() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <PDFDropzone />
        </div>

        <div>
          <ReceiptList />
        </div>
      </div>
    </div>
  );
}

export default Home;
