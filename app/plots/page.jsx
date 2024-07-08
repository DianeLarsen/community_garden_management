import PlotsList from "@/components/PlotsList";
import FindPlot from "@/components/FindPlot";


const PlotsPage = () => {

  return (
    <div className="container mx-auto p-6">
      <PlotsList />
      <hr className="my-6" />
      <FindPlot />
    </div>
  );
};

export default PlotsPage;
