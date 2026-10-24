# Checagens cruzadas — Debate da Globo (23/10/2026)

Compara, fala por fala, como Aos Fatos, Estadão Verifica, g1 Fato ou Fake, Ranking dos Políticos, Fato Carimbado e Terra checaram as afirmações de Lula e Flávio Bolsonaro.

Página: https://erico-rosa.github.io/checagens-cruzadas/

## Estrutura

- `index.html`: cabeçalho (metatags de compartilhamento) e estrutura da página
- `assets/style.css`, `assets/app.js`: visual e lógica
- `data/resumo.json`: falas, agrupamentos e vereditos (carregado primeiro, monta a lista)
- `data/detalhes.json`: análises e fontes de cada checagem (carregado em segundo plano)
- `og-image.jpg`: imagem de prévia para WhatsApp e redes

Os arquivos de dados são lidos por `fetch`, então a página precisa ser aberta por um servidor
(GitHub Pages ou, localmente, `python -m http.server`), e não com duplo clique no arquivo.

## Atualizar

Ao trocar os dados, altere a versão em `data-v` no `<html>` e nos `?v=` do `index.html`,
para os navegadores não usarem a versão antiga em cache.
