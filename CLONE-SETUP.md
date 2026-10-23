# RM LEILÕES

Projeto isolado em repositório, banco Supabase e implantação próprios.

- Os 63 veículos e preços, o motorista existente e as respectivas imagens foram copiados.
- O pátio foi definido como RM LEILÕES em Barueri/SP.
- Não foram copiados clientes, contratos, faturas nem rastreios.
- O contrato usa as cláusulas do documento de referência e os dados são preenchidos no painel.
- As credenciais ficam no `.env` local e nas variáveis secretas do Vercel.

O `.env` não deve ser versionado. O PDF e as fotos originais fornecidas na raiz também são ignorados pelo Git; os arquivos públicos necessários ficam em `public/`.
