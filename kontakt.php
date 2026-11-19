<?php
/*
 * Wysyłka formularza kontaktowego (strony głównej i podstrony Kontakt) na skrzynkę biura.
 *
 * Działa na zwykłym hostingu z PHP (tam, gdzie dziś stoi WordPress). Na GitHub Pages i Cloudflare
 * Pages PHP nie działa: wersja demo na GitHub tylko pokazuje komunikat, a na Cloudflare trzeba by
 * użyć innej metody wysyłki (opis w README).
 *
 * Co robi skrypt:
 *  1. przyjmuje wyłącznie wysyłkę metodą POST z tej samej domeny,
 *  2. sprawdza pola tak samo jak przeglądarka (js/main.js, część 6),
 *  3. odrzuca boty (ukryte pole „website”) i ogranicza liczbę wiadomości z jednego adresu IP,
 *  4. wysyła zwykły e-mail tekstowy na adres ODBIORCA; w polu „Odpowiedz do” jest adres nadawcy,
 *     jeśli podał e-mail, więc wystarczy kliknąć „Odpowiedz”.
 * Wiadomości nie są nigdzie zapisywane na serwerze.
 *
 * Ustawienia poniżej: ODBIORCA to skrzynka, na którą trafiają wiadomości. NADAWCA musi być adresem
 * w domenie msitelekom.pl, inaczej poczta może trafiać do spamu (SPF). Skrzynka NADAWCA nie musi
 * istnieć, ale serwer strony musi mieć prawo wysyłać pocztę w imieniu domeny.
 */

const ODBIORCA = 'biuro@msitelekom.pl';
const NADAWCA = 'strona@msitelekom.pl';
const TEMAT = 'Wiadomość ze strony msitelekom.pl';
const LIMIT_WIADOMOSCI = 5;       // ile wiadomości z jednego adresu IP...
const LIMIT_OKRES = 3600;         // ...w ciągu tylu sekund (3600 = godzina)

date_default_timezone_set('Europe/Warsaw');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

// Odpowiedź dla przeglądarki. Bez JavaScriptu (zwykłe wysłanie formularza) wracamy na stronę Kontakt
// z informacją w adresie (?wyslano=1 albo ?blad=1), którą odczytuje js/main.js.
function odpowiedz($ok, $kod = 200, $blad = '')
{
    $ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'fetch';
    if (!$ajax && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        header('Content-Type: text/html; charset=utf-8');
        header('Location: kontakt/?' . ($ok ? 'wyslano=1' : 'blad=1') . '#kontakt', true, 303);
        exit;
    }
    http_response_code($kod);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'blad' => $blad], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    odpowiedz(false, 405, 'metoda');
}

// Formularz wysłany z innej strony internetowej: odrzucamy.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? '');
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $host) {
    odpowiedz(false, 403, 'origin');
}

// Pobranie pola tekstowego: obcięcie spacji, usunięcie znaków sterujących (poza nową linią w wiadomości).
function pole($nazwa, $wielowierszowe = false)
{
    $v = isset($_POST[$nazwa]) && is_string($_POST[$nazwa]) ? $_POST[$nazwa] : '';
    if (!mb_check_encoding($v, 'UTF-8')) {
        return '';
    }
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = $wielowierszowe ? preg_replace('/[^\P{C}\n\t]/u', '', $v) : preg_replace('/\p{C}/u', ' ', $v);
    return trim($v);
}

$imie = pole('name');
$firma = pole('company');
$kontakt = pole('contact');
$tresc = pole('message', true);
$zgoda = isset($_POST['consent']);

// Ukryte pole-pułapka: człowiek go nie widzi, bot je wypełnia. Udajemy sukces, nic nie wysyłamy.
if (pole('website') !== '') {
    odpowiedz(true);
}

// Te same reguły co w przeglądarce, plus górne limity długości.
$email = filter_var($kontakt, FILTER_VALIDATE_EMAIL) !== false;
$cyfry = preg_replace('/[\s()+\-]/', '', $kontakt);
$telefon = preg_match('/^\d{9,13}$/', $cyfry) === 1;
if (mb_strlen($imie) < 2 || mb_strlen($imie) > 100
    || mb_strlen($firma) > 150
    || !($email || $telefon) || mb_strlen($kontakt) > 150
    || mb_strlen($tresc) < 10 || mb_strlen($tresc) > 5000
    || !$zgoda) {
    odpowiedz(false, 422, 'pola');
}

// Limit wiadomości z jednego adresu IP. Zapisywany jest tylko jednokierunkowy skrót adresu
// i godziny wysyłek, w katalogu tymczasowym serwera; wpisy starsze niż LIMIT_OKRES są pomijane.
$plik = rtrim(sys_get_temp_dir(), '/') . '/msi-formularz-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$teraz = time();
$wysylki = [];
if (is_readable($plik)) {
    foreach (explode("\n", (string) file_get_contents($plik)) as $t) {
        if ($t !== '' && (int) $t > $teraz - LIMIT_OKRES) {
            $wysylki[] = (int) $t;
        }
    }
}
if (count($wysylki) >= LIMIT_WIADOMOSCI) {
    odpowiedz(false, 429, 'limit');
}

// Treść e-maila (zwykły tekst, UTF-8).
$linie = [
    'Imię i nazwisko: ' . $imie,
    'Firma: ' . ($firma !== '' ? $firma : '(nie podano)'),
    'Telefon lub e-mail: ' . $kontakt,
    'Data: ' . date('Y-m-d H:i'),
    '',
    'Wiadomość:',
    $tresc,
    '',
    '--',
    'Wysłano z formularza kontaktowego na stronie ' . ($_SERVER['HTTP_HOST'] ?? 'msitelekom.pl') . '.',
    'Nadawca zaakceptował politykę prywatności.',
];
$cialo = chunk_split(base64_encode(implode("\r\n", $linie)));

// Nagłówki. Imię trafia tylko do tematu i treści, adres nadawcy do „Odpowiedz do” wyłącznie po
// sprawdzeniu filter_var, więc nie da się nimi dopisać własnych nagłówków (znaki nowej linii są usunięte).
$naglowki = [
    'From: =?UTF-8?B?' . base64_encode('Strona MSI Telekom') . '?= <' . NADAWCA . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];
if ($email) {
    $naglowki[] = 'Reply-To: ' . $kontakt;
}
$temat = '=?UTF-8?B?' . base64_encode(TEMAT . ': ' . mb_substr($imie, 0, 60)) . '?=';

$wyslane = mail(ODBIORCA, $temat, $cialo, implode("\r\n", $naglowki), '-f' . NADAWCA);
if (!$wyslane) {
    odpowiedz(false, 500, 'serwer');
}

$wysylki[] = $teraz;
@file_put_contents($plik, implode("\n", $wysylki), LOCK_EX);
odpowiedz(true);
