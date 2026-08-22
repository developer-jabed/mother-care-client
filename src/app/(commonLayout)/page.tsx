// import MotherCareHomepage from "@/components/shared/HomePage";
import AboutSection from "@/components/modules/homePage/About";
import AcademicPrograms from "@/components/modules/homePage/AcademicPrograms";
import AdmissionCTA from "@/components/modules/homePage/AdmissionCTA";
import FeedbackSection from "@/components/modules/homePage/Feedback";
import QuickStats from "@/components/modules/homePage/QuickStats";
import TeacherSection from "@/components/modules/homePage/TeacherSection";
import WhyChooseUs from "@/components/modules/homePage/WhyChoose";
import HomepageHeader from "@/components/shared/HomePageHeader";

// ✅ Cache the page for 30 minutes (ISR)
export const revalidate = 1800;

// Force static rendering for better caching
export const dynamic = "force-static";

export default function Home() {
  return (
    <div>
      {/* <MotherCareHomepage /> */}

      <HomepageHeader />

      <QuickStats />

      <AboutSection/>

      <AcademicPrograms/>

      <WhyChooseUs/>

      <AdmissionCTA/>

      <TeacherSection/>

      <FeedbackSection/>
    </div>
  );
}
