# Fruta Norte — site institucional

Site estático em HTML5, CSS3 e JavaScript vanilla, com formulário de contato via **SendGrid**.

## Estrutura

- Páginas na raiz: `index.html`, `produtos.html`, `sobre.html`, `qualidade.html`, `contato.html`
- Estilos: `css/variables.css`, `base.css`, `components.css`
- Scripts: `js/main.js`, `carousel.js`, `contact.js`, `animations.js`
- API Node (desenvolvimento): `api/server.js` — `POST /api/contact`
- Fallback produção (Apache/cPanel): `api/send-email.php`

## Desenvolvimento local com API Node

1. Copie `.env.example` para `.env` e preencha `SENDGRID_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`.
2. O remetente (`FROM_EMAIL`) deve estar verificado no SendGrid (domínio ou remetente único).
3. Instale dependências e suba o servidor:

```bash
cd /caminho/para/frutanorte
npm install
npm start
```

4. Acesse `http://localhost:3000/contato.html`. Com a porta **3000**, o script `js/contact.js` envia automaticamente para `/api/contact` (Express). Demais portas usam `data-contact-endpoint` no formulário ou o padrão `api/send-email.php`.

## Deploy Hostgator (cPanel / Apache)

1. Envie os arquivos do site para `public_html` (ou subpasta), **exceto** `node_modules` e `.env` se preferir não enviar — em produção o PHP lê `.env` na raiz do site ou variáveis do servidor.
2. Crie `.env` na mesma pasta que `index.html` (fora do versionamento) com:

   - `SENDGRID_API_KEY`
   - `FROM_EMAIL`
   - `TO_EMAIL`

   Proteja o arquivo: permissões restritas (ex.: 600). Em alguns ambientes é possível usar **SetEnv** no `.htaccess` para não manter `.env` na área pública — consulte a documentação da hospedagem.

3. No `contato.html`, mantenha `data-contact-endpoint="api/send-email.php"` (já é o padrão quando não está na porta 3000).
4. Ajuste `sitemap.xml`, `robots.txt` e meta `og:image` se o domínio final não for `www.frutanorte.com.br`.
5. Ative HTTPS e descomente o redirecionamento em `.htaccess` se desejar forçar SSL.

## Imagens

Placeholders em `assets/images/` (`hero-slide-*.jpg`, `og-image.jpg`) podem ser substituídos pelas fotos oficiais da marca (hero sugerido ~1920×900; OG ~1200×630).

## Licença / marca

Conteúdo e identidade visual pertencem à empresa Fruta Norte. Código de apoio conforme uso interno do projeto.
