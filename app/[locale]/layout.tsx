export {generateStaticParams} from "next-intlayer"; // Line to insert
import type {NextLayoutIntlayer} from "next-intlayer";
import {Inter} from "next/font/google";
import {getHTMLTextDir} from "intlayer";
import { SessionProvider } from '@/app/components/providers/SessionProvider';

const inter = Inter({subsets: ["latin"]});

const LocaleLayout: NextLayoutIntlayer = async ({children, params}) => {
  const {locale} = await params;


  return (
    <SessionProvider>
      <html lang={locale} dir={getHTMLTextDir(locale)}>
        <body className={inter.className}>
            {children}
        </body>
      </html>
    </SessionProvider>
  );
};

export default LocaleLayout;
