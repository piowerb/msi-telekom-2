# MSI Telekom, nowa strona (statyczna)

Czysty HTML, CSS i JavaScript. Bez bazy danych, bez CMS, bez budowania. Strona nie pobiera niczego ze starej strony msitelekom.pl.

## Adresy podstron

Podstrony mają **te same adresy co stara strona**, więc po przełączeniu domeny linki z Google i stare zakładki dalej działają:

| Adres | Strona |
|---|---|
| `/` | strona główna |
| `/internet-dla-firm/`, `/transmisja/`, `/wlokna-swiatlowodowe/`, `/uslugi-glosowe/`, `/przewierty-sterowane/` | usługi |
| `/aktualnosci/` + 5 wpisów pod dotychczasowymi adresami | aktualności (bez sekcji na stronie głównej) |
| `/mapa-sieci/`, `/referencje/`, `/firma/`, `/kontakt/`, `/polityka-prywatnosci/` | pozostałe |

`firma.html`, `referencje.html`, `polityka-prywatnosci.html` tylko przekierowują na nowe adresy (zostały, żeby stare linki do wersji demo nie przestały działać).

Wyjątek: w adresie artykułu o dzierżawie włókien poprawiona została literówka (`swiatlodowych` na `swiatlowodowych`). Stary adres przekierowuje na nowy: na Cloudflare przez `_redirects` (301), a w wersji demo przez stronę w katalogu o starej nazwie.

## Bezpieczeństwo

- Na serwerze są wyłącznie pliki statyczne: nie ma panelu logowania, bazy danych ani wtyczek, czyli typowych celów ataków na strony WordPress.
- `_headers` (Cloudflare) i `.htaccess.example` (Apache) ustawiają nagłówki bezpieczeństwa: CSP, HSTS, ochronę przed osadzaniem strony w ramce i inne.
- Strona nie pobiera niczego z zewnętrznych serwisów: mapa zasięgu jest jej częścią (rysunek SVG), bez Google i bez plików cookies.

## Publikacja pod msitelekom.pl

### Najszybciej: obecny serwer (tam, gdzie dziś działa WordPress)

Ta droga nie wymaga zmian w DNS, więc poczta w domenie działa dalej bez żadnych zmian.

1. Zrób pełną kopię obecnej strony (pliki i baza WordPressa), żeby w razie potrzeby wrócić do niej w kilka minut.
2. Przygotuj pliki: usuń z każdej strony linię `<meta name="robots" content="noindex, nofollow">` (opisana komentarzem „WERSJA DEMO”), zmień `robots.txt` na `Allow: /`, usuń katalog `wersja-2/`.
3. Skopiuj `.htaccess.example` jako `.htaccess` (nagłówki bezpieczeństwa, strona 404, przekierowania starych adresów).
4. Przenieś pliki WordPressa do katalogu z kopią poza katalogiem strony i wgraj w ich miejsce pliki tej strony (FTP lub menedżer plików w panelu hostingu).
5. Sprawdź formularz kontaktowy: wyślij wiadomość ze strony głównej i z podstrony Kontakt, sprawdź, czy dotarła na biuro@msitelekom.pl i czy „Odpowiedz” trafia do nadawcy (opis niżej).
6. Sprawdź skrzynki w domenie (biuro@, faktury@, noc@): wyślij i odbierz po jednej wiadomości.
7. Gdy wszystko działa i HTTPS jest na całej domenie, odkomentuj w `.htaccess` linię `Strict-Transport-Security`.

### Formularz kontaktowy

Formularz wysyła dane do `kontakt.php` w katalogu głównym strony, a ten skrypt wysyła e-mail na `biuro@msitelekom.pl` (ustawienia na początku pliku: odbiorca, nadawca, limit wiadomości). Wymaga PHP, które jest na obecnym serwerze. Wiadomości nie są zapisywane na serwerze.

- Jeśli wiadomość nie dochodzi: sprawdź folder spam i w panelu hostingu, czy serwer może wysyłać pocztę jako `strona@msitelekom.pl` (rekord SPF domeny musi obejmować serwer strony). Gdy poczta domeny działa na innym serwerze niż strona, w panelu hostingu trzeba ustawić obsługę poczty jako zdalną (inaczej serwer strony próbuje dostarczyć wiadomość lokalnie).
- Na GitHub Pages formularz tylko pokazuje komunikat o wersji demonstracyjnej.

### Później, opcjonalnie: Cloudflare Pages

1. W panelu Cloudflare: **Workers & Pages**, utwórz projekt **Pages**, połącz z repozytorium albo wgraj folder. Bez frameworka i bez polecenia build. Pliki `_headers` i `_redirects` Cloudflare stosuje automatycznie.
2. Przy przenoszeniu DNS domeny do Cloudflare **przenieś wszystkie rekordy, zwłaszcza MX, SPF, DKIM i DMARC**, a rekordy poczty zostaw jako „DNS only” (szara chmurka). Bez nich przestanie działać poczta w domenie msitelekom.pl.
3. Na Cloudflare Pages nie działa PHP, więc formularz trzeba wtedy przełączyć na inną wysyłkę (np. Pages Functions z usługą pocztową).

## Wersja demo na GitHub Pages

Ścieżki są względne, więc strona działa też pod `uzytkownik.github.io/repozytorium/`. Na GitHub Pages pliki `_headers` i `_redirects` są ignorowane (to dotyczy tylko demo). Strona `404.html` ma mały skrypt, który na GitHub Pages dopisuje podkatalog do linków i stylów; na docelowej domenie nic nie robi.

## Do weryfikacji przez klienta

- Opis SLA i sekcja „MSI Telekom w skrócie” nie podają liczb (dostępność w %, czas usunięcia awarii, rok założenia, długość sieci). Po potwierdzeniu wartości przez MSI można je dopisać.
- Aktualności: najnowsze wpisy są z lat 2017 i 2018, dlatego sekcja została zdjęta ze strony głównej. Po dodaniu nowych wpisów można ją przywrócić.
- Teksty usług i wpisów to zredagowane, skrócone wersje treści ze starej strony, w formalnym stylu. Jeśli klient woli oryginały, wystarczy podmienić akapity.
- Adresy e-mail opiekunów Klienta pochodzą z treści starej strony kontakt. Na starej stronie linki przy tych adresach prowadziły do innej skrzynki, więc warto potwierdzić, które adresy są aktualne.
- Logotypy referencji pochodzą z dotychczasowej strony. Klient potwierdza zgody na ich użycie i aktualność listy (np. Multimedia Polska działa obecnie w ramach Vectry).
- Polityka prywatności ma nową sekcję „Formularz kontaktowy na stronie” (dane, cel, podstawa prawna, okres przechowywania). Klient potwierdza jej treść.
- W polityce prywatności podmienione zostały nieaktualne linki (GIODO, Internet Explorer, stare strony pomocy przeglądarek). Sam tekst jest bez zmian, więc nadal powołuje się na ustawę Prawo telekomunikacyjne, którą zastąpiła ustawa Prawo komunikacji elektronicznej. Warto, żeby klient zaktualizował ten fragment.

## Kolorystyka

Klient wybrał wersję w dotychczasowych kolorach MSI Telekom, ze starym logo: fioletowy pasek u góry, czarno-fioletowe tło, magentowe akcenty. Wersja niebieska nie jest publikowana.

Katalog `wersja-2/` zawiera tylko przekierowania: wersja demo była wcześniej pod adresem `.../wersja-2/`, więc stare linki prowadzą teraz do tych samych podstron w katalogu głównym. Na Cloudflare to samo robi plik `_redirects`, dlatego przed publikacją pod msitelekom.pl katalog `wersja-2/` można usunąć.

## Mapa zasięgu

Mapa na stronie głównej i na podstronie Mapa zasięgu to rysunek SVG zapisany w treści strony, więc nie wymaga Google ani zgody na pliki cookies. Pokazuje 51 miejscowości z listy pod mapą. Najechanie lub dotknięcie punktu pokazuje nazwę, przycisk przybliża okolice Olsztyna, a kliknięcie nazwy na liście wskazuje miejscowość na mapie.

- Kontury województw: [polska-geojson](https://github.com/ppatrzyk/polska-geojson) (licencja MIT), na podstawie Państwowego Rejestru Granic (GUGiK).
- Położenie miejscowości: Państwowy Rejestr Nazw Geograficznych (GUGiK). Nazwy są zapisane zgodnie z rejestrem (Kieźliny, Pasłęk, Ruciane-Nida).
- Dodanie miejscowości: nowy punkt trzeba dopisać do rysunku SVG (atrybut `transform="translate(x y)"` podaje położenie) i do listy pod mapą.

## Logotypy referencji

Pliki są w `assets/img/referencje/` (WebP, białe tło usunięte, przycięte marginesy). Pochodzą z dotychczasowej strony msitelekom.pl, a logo CFC z cfc.net.pl. Na komputerze są w skali szarości i nabierają koloru po najechaniu kursorem, na telefonach są w kolorze.

## Wygląd

Kolory wersji wybranej przez klienta włącza klasa `theme-classic` na znaczniku `<body>`. Odpowiadające jej style są na końcu `css/style.css`, w sekcji „WERSJA 2”. Ze struktury Exatela pochodzą moduły usług nachodzące na górną sekcję oraz akordeon z najczęściej zadawanymi pytaniami.

## Co jest w którym pliku

| Plik lub katalog | Do czego służy |
|---|---|
| `index.html` | strona główna |
| `nazwa-podstrony/index.html` | każda podstrona ma własny katalog, dzięki temu adresy są takie jak na starej stronie |
| `css/style.css` | cały wygląd strony: kolory, układ, wersja na telefon. Na początku pliku jest spis jego części |
| `js/main.js` | menu na telefonie, interaktywna mapa zasięgu, sprawdzanie i wysyłka formularza. Na początku pliku jest spis jego części |
| `assets/logo-stare.png`, `assets/favicon.png` | logo i ikona w karcie przeglądarki |
| `assets/img/referencje/` | logotypy klientów w sekcji „Zaufali nam” i na stronie Referencje |
| `wersja-2/` | tylko przekierowania ze starych linków wersji demo (można usunąć przed publikacją) |
| `404.html` | strona wyświetlana, gdy adres nie istnieje |
| `firma.html`, `referencje.html`, `polityka-prywatnosci.html` | przekierowania ze starych adresów wersji demo |
| `_headers` | nagłówki bezpieczeństwa dla Cloudflare Pages (opis każdego nagłówka w komentarzach w pliku) |
| `_redirects` | przekierowania starych adresów dla Cloudflare Pages |
| `kontakt.php` | wysyłka formularza kontaktowego e-mailem na biuro@msitelekom.pl (działa na serwerze z PHP) |
| `.htaccess.example` | to samo co `_headers` i `_redirects`, ale dla zwykłego hostingu z Apache |
| `robots.txt` | informacja dla wyszukiwarek, czy mogą indeksować stronę |
| `.nojekyll` | pusty plik, który mówi GitHub Pages, żeby publikował pliki bez przetwarzania |

W plikach HTML, CSS i JS są komentarze po polsku, które opisują poszczególne części: w HTML w znacznikach `<!-- ... -->`, w CSS i JS w `/* ... */` oraz `//`.

## Edycja

Każda podstrona to `nazwa/index.html`. Menu i stopka są powtórzone w każdym pliku, więc zmianę w nich trzeba wprowadzić we wszystkich stronach. Kolory są w `:root` na początku `css/style.css`. Po zmianie CSS lub JS podbij numer wersji `?v=14` w plikach HTML.
