import Image from "next/image";
import Link from "next/link";
import layoutStyles from "./layout.module.css";
import utilStyles from "./utils.module.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={layoutStyles.container}>
      <header className={layoutStyles.header}>
        <Image
          priority
          src="/images/profile.jpg"
          className={utilStyles.borderCircle}
          height={222}
          width={222}
          alt="Scott Herlihy"
        />
        <h1 className={utilStyles.heading2Xl}>Scott Herlihy</h1>
      </header>
      <main>
        <section className={utilStyles.headingMd}>
          <p>
            Hi I&apos;m Scott, I&apos;m interested in space, robotics, crypto,
            and urban infrastructure.
          </p>
          <p>
            This is a personal website where I am having fun learning about how
            to build web apps. I don&apos;t have a lot of front-end experience,
            but I&apos;ve challenged myself to work on this website every day for
            the next year and see where I end up. Hopefully I learn a lot and
            build some cool things in the process. Follow along with the links
            below and let me know if you have any ideas on what I should build!
          </p>
          <p>
            See what I&apos;m building at my{" "}
            <a href="https://github.com/scottherlihy">github</a> and see the
            bad jokes I&apos;m making on{" "}
            <a href="https://twitter.com/________scott">twitter</a>.
          </p>
        </section>

        <div className={styles.grid}>
          <Link href="/morning" className={styles.card}>
            <h3>Good Morning &rarr;</h3>
            <p>An in depth dashboard I created for my morning routine.</p>
          </Link>
        </div>

        <div className={layoutStyles.rocket}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/rocket.png" alt="zoom" />
        </div>
      </main>
    </div>
  );
}
