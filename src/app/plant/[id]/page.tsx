import { notFound } from "next/navigation";
import Header from "@/components/Header";
import IntakeForm from "@/components/IntakeForm";
import { getPlantById } from "@/lib/queries";
import styles from "./page.module.css"; // Create this module next

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PlantPage({ params }: Props) {
    const { id } = await params;
    const plant = await getPlantById(id);

    if (!plant) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <Header />

            {/* Background Image Layer */}
            <div className={styles.background}>
                {/* In real app: <Image src={plant.imageUrl} fill ... /> */}
                {/* Using gradient fallback for now */}
                <div className={styles.gradient} />
            </div>

            <div className={styles.container}>
                <div className={styles.spacer} /> {/* Pushes form to bottom on mobile */}
                <IntakeForm plant={plant} />
            </div>
        </main>
    );
}
