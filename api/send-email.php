<?php
/**
 * Fruta Norte — envio de contato via SendGrid (fallback Apache/cPanel).
 * Configure variáveis em .env na raiz do site ou via SetEnv no .htaccess (sem commitar segredos).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '[]', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

if (!empty(trim((string)($data['website'] ?? '')))) {
    echo json_encode(['success' => true]);
    exit;
}

function env_var(string $key, ?string $default = null): ?string
{
    $v = getenv($key);
    if ($v !== false && trim($v) !== '') {
        return trim($v);
    }
    static $fileEnv = null;
    if ($fileEnv === null) {
        $fileEnv = [];
        $path = dirname(__DIR__) . '/.env';
        if (is_readable($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            foreach ($lines as $line) {
                $t = ltrim($line);
                if ($t !== '' && isset($t[0]) && $t[0] === '#') {
                    continue;
                }
                if (strpos($line, '=') === false) {
                    continue;
                }
                [$k, $val] = explode('=', $line, 2);
                $k = trim($k);
                $val = trim($val, " \t\"'");
                $fileEnv[$k] = $val;
            }
        }
    }
    return $fileEnv[$key] ?? $default;
}

$apiKey = env_var('SENDGRID_API_KEY');
$from = env_var('FROM_EMAIL');
$to = env_var('TO_EMAIL');

if (!$apiKey || !$from || !$to) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Servidor de e-mail não configurado.']);
    exit;
}

$subjectLabels = [
    'comercial' => 'Comercial / revenda',
    'parceria' => 'Parceria / eventos',
    'qualidade' => 'Qualidade / documentação',
    'outro' => 'Outro',
];

$cut = static function (string $s, int $max): string {
    if (function_exists('mb_substr')) {
        return mb_substr($s, 0, $max);
    }
    return strlen($s) > $max ? substr($s, 0, $max) : $s;
};
$len = static function (string $s): int {
    return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
};

$name = $cut(trim((string)($data['name'] ?? '')), 120);
$email = $cut(trim((string)($data['email'] ?? '')), 254);
$phone = $cut(trim((string)($data['phone'] ?? '')), 40);
$subjectKey = trim((string)($data['subject'] ?? ''));
$message = $cut(trim((string)($data['message'] ?? '')), 4000);

if ($len($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nome inválido']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-mail inválido']);
    exit;
}
if (!isset($subjectLabels[$subjectKey])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Assunto inválido']);
    exit;
}
if ($len($message) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Mensagem muito curta']);
    exit;
}

$subjectLine = '[Fruta Norte] Contato: ' . $subjectLabels[$subjectKey];
$textBody = "Nome: $name\nE-mail: $email\n";
if ($phone !== '') {
    $textBody .= "Telefone: $phone\n";
}
$textBody .= 'Assunto: ' . $subjectLabels[$subjectKey] . "\n\n" . $message;

$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safeSub = htmlspecialchars($subjectLabels[$subjectKey], ENT_QUOTES | ENT_HTML5, 'UTF-8');
$safeMsg = htmlspecialchars($message, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$htmlBody = "<p><strong>Nome:</strong> $safeName</p><p><strong>E-mail:</strong> $safeEmail</p>";
if ($phone !== '') {
    $htmlBody .= "<p><strong>Telefone:</strong> $safePhone</p>";
}
$htmlBody .= "<p><strong>Assunto:</strong> $safeSub</p><hr /><pre style=\"white-space:pre-wrap;font-family:sans-serif\">$safeMsg</pre>";

$payload = [
    'personalizations' => [['to' => [['email' => $to]]]],
    'from' => ['email' => $from],
    'reply_to' => ['email' => $email],
    'subject' => $subjectLine,
    'content' => [
        ['type' => 'text/plain', 'value' => $textBody],
        ['type' => 'text/html', 'value' => $htmlBody],
    ],
];

$ch = curl_init('https://api.sendgrid.com/v3/mail/send');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
]);

$response = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code >= 200 && $code < 300) {
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(500);
echo json_encode(['success' => false, 'message' => 'Falha ao enviar. Tente mais tarde.']);
