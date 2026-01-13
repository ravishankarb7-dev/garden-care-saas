import Header from "@/components/Header";
import PlantLibrary from "@/components/PlantLibrary";
import { getPlants } from "@/lib/queries";

export default async function LibraryPage() {
    const plants = await getPlants();

    return (
        <main style={{ minHeight: "100vh", backgroundColor: "white" }}>
            <Header />
            <PlantLibrary plants={plants} />
        </main>
    );
}
