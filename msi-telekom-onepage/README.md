# MSI Telekom, nowa strona (wersja demo)

Czysty HTML, CSS i JavaScript. Bez bibliotek, bez budowania, bez Node.js. Wystarczy wgrać pliki.

## Strony

- `index.html`: strona główna (hero, oferta, aktualności, mapa zasięgu, referencje, kontakt)
- `firma.html`: O firmie
- `referencje.html`: Referencje (9 firm)
- `polityka-prywatnosci.html`: Polityka prywatności (treść bez zmian, ze spisem treści)

Treści podstron pochodzą z msitelekom.pl/firma/, /referencje/ i /polityka-prywatnosci/.

## Uruchomienie lokalnie

W VS Code: rozszerzenie Live Server, "Open with Live Server" na pliku `index.html`.
Albo w terminalu, w tym folderze: `python -m http.server 8000` i otwórz http://localhost:8000

## Obrazy

Obrazów nie ma w paczce, bo należą do obecnej strony. Strona szuka ich najpierw w `assets/img/`, a jeśli ich tam nie ma, pobiera z msitelekom.pl (to działa tylko na czas demo). Jeśli nie zostaną załadowane wcale, pokazują się teksty zastępcze. Żeby mieć wszystko lokalnie, uruchom w głównym folderze projektu:

    curl -o assets/img/logo.png https://msitelekom.pl/wp-content/uploads/2019/11/msitelekom-1.png
    curl -o assets/img/mapa.jpg https://msitelekom.pl/wp-content/uploads/2019/12/mapa.jpg
    curl -o assets/img/referencje.gif https://msitelekom.pl/wp-content/uploads/2015/04/referencje.gif
    curl -o assets/img/firma/uslugi-teleinformatyczne.jpg https://msitelekom.pl/wp-content/uploads/2015/04/uslugi-teleinformatyczne.jpg
    curl -o assets/img/firma/msi-telekom.jpg https://msitelekom.pl/wp-content/uploads/2015/04/msi-telekom.jpg
    curl -o assets/img/referencje/exatel.jpg https://msitelekom.pl/wp-content/uploads/2015/11/Exatel1-400x284.jpg
    curl -o assets/img/referencje/aero2.jpg https://msitelekom.pl/wp-content/uploads/2015/11/aero2-400x284.jpg
    curl -o assets/img/referencje/porta.jpg https://msitelekom.pl/wp-content/uploads/2015/04/porta-400x284.jpg
    curl -o assets/img/referencje/giganet.jpg https://msitelekom.pl/wp-content/uploads/2015/04/giganet-400x284.jpg
    curl -o assets/img/referencje/hurtownie-elektryk.jpg https://msitelekom.pl/wp-content/uploads/2015/11/Hurtownie-Elektryk-400x284.jpg
    curl -o assets/img/referencje/multimedia-polska.jpg https://msitelekom.pl/wp-content/uploads/2015/11/Multimedia-Polska-S.A.-400x284.jpg
    curl -o assets/img/referencje/netia.jpg https://msitelekom.pl/wp-content/uploads/2015/04/netia-400x284.jpg
    curl -o assets/img/referencje/play.jpg https://msitelekom.pl/wp-content/uploads/2015/04/play-400x284.jpg
    curl -o assets/img/referencje/cfc.png https://msitelekom.pl/wp-content/uploads/2019/12/wwwwCFC-tv.png

Uwaga: obecne logo jest w kolorach magenta i fioletu. Czy zostaje, czy dostanie wersję niebieską, to decyzja klienta. Kafelki referencji otwierają pełny obraz z msitelekom.pl (po zastąpieniu starej strony trzeba te linki zmienić na lokalne pliki).

## Publikacja dema na GitHub Pages

1. Utwórz repozytorium (publiczne, chyba że masz płatny plan GitHub) i wrzuć do niego zawartość tego folderu.
2. Settings, Pages, "Deploy from a branch", gałąź `main`, katalog `/ (root)`.
3. Ścieżki są względne, więc strona działa zarówno pod `uzytkownik.github.io/repo/`, jak i pod własną domeną.

Wersja demo ma `noindex` w każdym pliku HTML oraz `robots.txt` z `Disallow: /`, żeby Google nie zaindeksowało jej przed startem.

## Do uzupełnienia

- Opis usługi "Przewierty sterowane" (na stronie głównej starej witryny go nie ma, jest na podstronie).
- Telefon biura i NIP (adres i e-maile biura pochodzą z polityki prywatności).
- Wysyłka formularza kontaktowego. Teraz formularz tylko waliduje pola i pokazuje komunikat demo.
- Linki "Zobacz szczegóły", artykuły i mapa prowadzą na obecną stronę WordPress. Po jej zastąpieniu przestaną działać, więc trzeba je zamienić na własne podstrony lub dodać przekierowania (patrz `.htaccess.example`).
- Polityka prywatności to tekst z 2018 roku i mówi o cookies oraz podmiotach marketingowych. Nowa strona nie ustawia cookies, więc klient powinien potwierdzić, czy treść jest aktualna. Formularz kontaktowy nie jest w niej opisany.
- Brak sekcji FAQ, bo nie ma jej w treściach źródłowych.

## Zmiany względem treści źródłowej

- Literówki: "Łaczymy" na "Łączymy", "wykorzystac" na "wykorzystać" (podstrona O firmie), "światłodowych" na "światłowodowych" (wpis z 2018 roku i opis meta).
- Myślniki w tekstach (O firmie, zajawka wpisu z 2017 roku) zastąpione dwukropkiem lub przecinkiem. Polityka prywatności zostaje bez zmian, także w interpunkcji.
- Na stronie Referencje zdanie wstępne pojawia się raz (na starej stronie było powtórzone).
- Pozycje list zaczynają się wielką literą.
- Ton całej strony przeredagowany na formalny, biznesowy: zwrot "Państwa" zamiast "Ty", neutralne etykiety przycisków ("Nasza oferta", "Szczegóły usługi", "Pełny artykuł", "Kontakt"), formalne komunikaty formularza.
- Podstrona O firmie napisana od nowa w tym samym zakresie merytorycznym (misja, podejście do współpracy, cztery wartości, korzyści, zaproszenie do współpracy). Usunięto hasło "Polak potrafi" i pytania retoryczne. Tekst jest podpisany przez prezesa, więc wymaga jego akceptacji.
- Zajawki trzech wpisów na stronie głównej to krótkie streszczenia w formalnym języku (artykuły pod linkami bez zmian, z tytułami w oryginale, w tym "Odkryj moc Internetu światłowodowego dla Twojej firmy!").
- Polityka prywatności bez zmian, także w zwrotach i interpunkcji.

## Wdrożenie na serwer klienta

1. Usuń z każdego pliku HTML linię `<meta name="robots" content="noindex, nofollow">` i zmień `robots.txt` (albo usuń).
2. Wgraj wszystkie pliki przez SFTP do katalogu strony.
3. Skopiuj `.htaccess.example` jako `.htaccess` (nagłówki bezpieczeństwa, HTTPS, cache, przekierowania starych adresów).
4. Podłącz wysyłkę formularza w miejscu oznaczonym `DEMO` w `js/main.js`.
5. Po wdrożeniu sprawdź nagłówki na securityheaders.com.

## Projekt: co z Exatela, co z CFC

Z Exatela: granatowy hero na całą szerokość, trzykolumnowe moduły usług nachodzące na hero (białe karty z cienkimi strzałkami), wyraźna hierarchia i korporacyjny ton.
Z CFC: dużo bieli i przestrzeni, jasnoniebieskie tła sekcji, jasnoniebieska stopka z niebieskimi punktorami, prosty układ "tekst obok obrazu".
Hero nawiązuje do globusa ze starej strony: to horyzont planety z połączeniami światłowodowymi i impulsami światła (SVG w `index.html`, animacja w CSS).

## Struktura

    index.html, firma.html, referencje.html, polityka-prywatnosci.html
    css/style.css     style (tokeny kolorów na górze pliku)
    js/main.js        menu mobilne, formularz, zapasowe ładowanie obrazów
    assets/           favicon i obrazy
    robots.txt        blokada indeksowania (tylko demo)
    .htaccess.example konfiguracja Apache na produkcję

## Kolory i czcionki

Paleta jest w `:root` na początku `css/style.css` (akcent `#2EA3F2`, granat, jasne błękity). Używane są czcionki systemowe, więc strona nie wysyła zapytań do zewnętrznych serwisów (zgodność z RODO). Własną czcionkę dodasz, wgrywając pliki `.woff2` do `assets/fonts/` i odkomentowując blok `@font-face` w CSS.
