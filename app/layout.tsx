import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Alex_Brush, Urbanist, Anton, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import DesktopFrame from "@/components/common/DesktopFrame";
import { getGeneralSettings, getContactSettings } from "@/lib/site-settings";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alexbrush",
  subsets: ["latin"],
  weight: "400",
});

// Mẫu dùng next/font/local: font Playfair Display tự tải về từ kho Google
// Fonts chính chủ (github.com/google/fonts, giấy phép SIL OFL — xem
// fonts/playfair-display/OFL.txt), lưu ngay trong project thay vì tải qua
// next/font/google lúc build. Đây là bản variable font (1 file, hỗ trợ mọi
// độ đậm 400–900) — khi có file font thương mại thật (SVN-Gilroy, Valencia,
// DFVN Calathea), chỉ cần lặp lại đúng cách này với file đó.
const playfair = localFont({
  src: "../fonts/playfair-display/PlayfairDisplay-Variable.ttf",
  variable: "--font-playfair",
  weight: "400 900",
});

// Tạm thay cho SVN-Gilroy (font trả phí) cho tới khi có file font thật.
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
//font trên web
const ValenciaLight = localFont({
  src: "../fonts/Valencia-Light Regular.ttf",
  variable: "--font-valencia-light",
  weight: "400",
});
const DFVNCalathea = localFont({
  src: "../fonts/DFVN CALATHEA.otf",
  variable: "--font-dfvn-calathea",
  weight: "400",
});
const BlostaScript = localFont({
  src: "../fonts/Blosta-Script.otf",
  variable: "--font-blosta-script",
  weight: "400",
});
const losevkaCharon = localFont({
  src: "../fonts/Iosevka_Charon_Mono/IosevkaCharonMono-Regular.ttf",
  variable: "--font-losevka-charon",
  weight: "400",
});
const DFVNDesirableCalligraphy = localFont({
  src: "../fonts/DFVN Desirable Calligraphy.otf",
  variable: "--font-dfvn-desirable-calligraphy",
  weight: "400",
});
const SVNLightitalic = localFont({
  src: "../fonts/SVN-Gilroy/SVN-Gilroy Light Italic.ttf",
  variable: "--font-svn-light-italic",
  weight: "400",
});
const SVNBold = localFont({
  src: "../fonts/SVN-Gilroy/SVN-Gilroy Bold.ttf",
  variable: "--font-svn-bold",
  weight: "400",
});
const SVNGilroy = localFont({
  src: "../fonts/SVN-Gilroy/SVN-Gilroy Regular.ttf",
  variable: "--font-svn-regular",
  weight: "400",
});
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getGeneralSettings();
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: "Destination wedding and editorial photography.",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getGeneralSettings();
  const contact = await getContactSettings();
  const whatsappPhone =
    contact.infoColumns.find((column) => column.label === "Phone:")?.lines[0] ?? "";

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${alexBrush.variable} ${playfair.variable} ${urbanist.variable} ${anton.variable} ${jetbrainsMono.variable} ${ValenciaLight.variable} ${DFVNCalathea.variable} ${BlostaScript.variable} ${losevkaCharon.variable} ${DFVNDesirableCalligraphy.variable} ${SVNLightitalic.variable} ${SVNBold.variable} ${SVNGilroy.variable} antialiased`}
    >
      <body className="bg-white font-valencia-light text-ink">
        <DesktopFrame className="flex min-h-screen flex-col">
          <Nav siteName={settings.siteName} instagramUrl={settings.instagramUrl} />
          <div id="top" />
          <main className="flex-1">{children}</main>
          <Footer
            siteName={settings.siteName}
            contactEmail={settings.contactEmail}
            instagramUrl={settings.instagramUrl}
            whatsappPhone={whatsappPhone}
          />
        </DesktopFrame>
      </body>
    </html>
  );
}
