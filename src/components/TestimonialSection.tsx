import styles from "./TestimonialSection.module.css";
import { Star } from "lucide-react";

export default function TestimonialSection() {
    return (
        <section className={styles.section} aria-label="Customer Reviews">
            <div className={styles.container}>
                <h2 className={styles.header}>Loved by 50,000+ Thriving Plants</h2>

                <div className={styles.grid}>
                    <div className={styles.review}>
                        <div className={styles.stars} aria-label="5 out of 5 stars">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <blockquote className={styles.quote}>
                            "I used to kill everything. My EasyPlant rose is the first one to survive a Chicago winter thanks to the frost alerts!"
                        </blockquote>
                        <cite className={styles.author}>- Sarah J., Chicago</cite>
                    </div>

                    <div className={styles.review}>
                        <div className={styles.stars} aria-label="5 out of 5 stars">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <blockquote className={styles.quote}>
                            "The care schedule updates automatically when it rains? Genius. My hydrangeas are huge."
                        </blockquote>
                        <cite className={styles.author}>- Mike R., Seattle</cite>
                    </div>
                </div>
            </div>
        </section>
    );
}
