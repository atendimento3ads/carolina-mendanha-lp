# LP — Carolina Mendanha · Advocacia Trabalhista Empresarial

Landing page institucional/de conversão para a advogada **Ana Carolina Mendanha**
(defesa trabalhista para empresas acionadas, notificadas ou intimadas).

Site estático — HTML + CSS (sem build, sem dependências).

## Estrutura

```
.
├── index.html        # Página principal (versão em produção)
├── assets/
│   ├── hero-carolina.png    # Foto da hero
│   └── sobre-carolina.png   # Foto da seção "Autoridade"
├── .cpanel.yml       # Deploy automático no cPanel (Git Version Control)
├── .gitignore
└── _dev/             # Materiais de desenvolvimento (NÃO publicados)
    └── index-v2.html # Versão alternativa "Dossiê Editorial" (referência)
```

## Visualizar localmente

Basta abrir o `index.html` no navegador, ou servir a pasta:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Deploy via cPanel (Git™ Version Control)

1. No cPanel, abra **Git Version Control → Create**.
2. Marque **Clone a Repository** e informe a URL do repositório no GitHub.
3. Defina o diretório do repositório (ex.: `repositories/lp-carolina-mendanha`).
4. Antes do primeiro deploy, edite o `.cpanel.yml` e troque `CPANEL_USER`
   pelo usuário da conta cPanel (e o caminho, se for subpasta/subdomínio).
5. Em **Manage → Pull or Deploy → Update from Remote** e depois **Deploy HEAD Commit**.

A cada `git push` na branch `main`, faça **Update + Deploy** no cPanel para publicar.

## Pendências antes de publicar

- [ ] Substituir `OAB/UF nº XXXXX` pelo número real (rodapé/topo).
- [ ] Ligar os botões "Falar com a advogada" ao link real do **WhatsApp**
      (`https://wa.me/55DDDNUMERO`).
- [ ] Conferir `CPANEL_USER` no `.cpanel.yml`.

---
Desenvolvido por **3ADS**.
