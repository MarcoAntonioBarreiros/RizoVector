# RizoVetor v3.5 — Raiz Viva / Colonização Fúngica

## Como executar

Dê dois cliques em `INICIAR_JOGO.bat`, ou execute:

```bash
python -m http.server 8000
```

e abra `http://localhost:8000`.

## Mudanças principais

- `Bacillus` volta a ter função recorrente: o biofilme é temporário, decai com o tempo e com colisões.
- A barreira fúngica cresce em cena, com aparência de colonização orgânica e abertura estreita alternativa.
- `Trichoderma` continua sendo a única forma de romper a estrutura principal da barreira.
- A micorriza agora projeta hifas/raios guiados que caminham em direção a fungos e barreiras.
- A raiz amadurecida fica mais larga e mais ocre/bege, com aparência mais orgânica.
- A ponta da raiz (coifa) foi redesenhada em tons marrons/ocres.
- Foram adicionados botões de zoom in/out para inspecionar melhor a raiz formada.
- Foi adicionado um novo inimigo: parasita aderente da rizosfera, que busca a raiz formada e é removido pelo pulso ISR (`E`).
