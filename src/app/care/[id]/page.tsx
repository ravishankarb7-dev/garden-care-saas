import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CareScheduleTable from "@/components/CareScheduleTable";
import CalendarButton from "@/components/CalendarButton";
import WeatherWidget from "@/components/WeatherWidget";
import TroubleshootingGuide from "@/components/TroubleshootingGuide";
import { getPlantById } from "@/lib/queries";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CarePage({ params, searchParams }: Props) {
    const { id } = await params;
    const { zip, start } = await searchParams;

    const plant = await getPlantById(id);

    if (!plant) {
        notFound();
    }

    // Fallback if no start date provided
    const startDate = typeof start === "string" ? start : new Date().toISOString().split('T')[0];
    const location = typeof zip === "string" ? zip : "Unknown";

    return (
        <main style={{
            minHeight: "100vh",
            backgroundColor: "var(--color-green-900)",
            color: "white",
            backgroundImage: "radial-gradient(circle at 10% 20%, rgba(56, 102, 75, 0.4) 0%, rgba(15, 31, 21, 0) 50%)"
        }}>
            <Header />

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>

                <div style={{
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem"
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "2.5rem",
                            color: "white",
                            marginBottom: "0.25rem"
                        }}>
                            {plant.name}
                        </h1>
                        <p style={{ color: "var(--color-lime-400)", opacity: 0.8 }}>
                            Care Schedule • Started {new Date(startDate).toLocaleDateString()}
                        </p>
                    </div>
                    <CalendarButton plant={plant} startDate={startDate} />
                </div>

                <WeatherWidget location={location} />

                <h2 style={{
                    fontSize: "1.25rem",
                    marginBottom: "1.5rem",
                    color: "white",
                    borderBottom: "1px solid var(--color-glass-border)",
                    paddingBottom: "0.5rem"
                }}>
                    Upcoming Tasks
                </h2>

                <CareScheduleTable plant={plant} startDate={startDate} />

                <TroubleshootingGuide plant={plant} />
            </div>
        </main>
    );
}
