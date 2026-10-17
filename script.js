import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- Conexão com o Supabase ----------
const supabase = createClient(
    "https://uxnddxayzgedcyvrbxhg.supabase.co",
    "sb_publishable_9vX4E28Vx_RgxurHkI79yQ_NehPrVI1"
);

// Guarda o Pokémon que está aparecendo na tela
let pokemonAtual = null;

// ---------- BUSCA (API do Pokémon) ----------
async function buscarPokemon(nome) {

    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "<p>Carregando...</p>";

    try {

        const resposta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${nome}`
        );

        if (!resposta.ok) {
            throw new Error("Pokémon não encontrado");
        }

        const dados = await resposta.json();

        const tipo = dados.types
            .map(item => item.type.name)
            .join(", ");

        // Guarda só o que vamos salvar no banco
        pokemonAtual = {
            pokemon_id: dados.id,
            nome: dados.name,
            imagem: dados.sprites.front_default,
            tipos: tipo
        };

        resultado.innerHTML = `
            <div class="pokemon-card">

                <img
                    src="${dados.sprites.front_default}"
                    alt="${dados.name}"
                >

                <h2>${dados.name}</h2>

                <p><strong>Tipo:</strong> ${tipo}</p>

                <p><strong>Altura:</strong> ${dados.height / 10} m</p>

                <p><strong>Peso:</strong> ${dados.weight / 10} kg</p>

                <p><strong>Número:</strong> ${dados.id}</p>

                <button id="botao-favoritar" class="btn-favoritar">
                    ⭐ Adicionar ao time
                </button>

            </div>
        `;

        document
            .getElementById("botao-favoritar")
            .addEventListener("click", adicionarAoTime);

    } catch (erro) {

        pokemonAtual = null;

        resultado.innerHTML = `
            <p>
                ❌ Pokémon não encontrado.
                Tente outro nome ou número.
            </p>
        `;
    }
}

// ---------- CREATE: salvar no banco ----------
async function adicionarAoTime() {

    if (!pokemonAtual) return;

    const botao = document.getElementById("botao-favoritar");
    botao.disabled = true;

    // Evita repetir o mesmo Pokémon no time
    const { data: existente } = await supabase
        .from("favorito")
        .select("id")
        .eq("pokemon_id", pokemonAtual.pokemon_id);

    if (existente && existente.length > 0) {
        botao.textContent = "✅ Já está no time";
        return;
    }

    const { error } = await supabase
        .from("favorito")
        .insert(pokemonAtual);

    if (error) {
        console.error("Erro ao salvar:", error);
        botao.textContent = "❌ Erro ao salvar";
        botao.disabled = false;
        return;
    }

    botao.textContent = "✅ Adicionado!";
    listarTime();
}

// ---------- READ: listar do banco ----------
async function listarTime() {

    const lista = document.getElementById("lista-time");

    const { data, error } = await supabase
        .from("favorito")
        .select("*")
        .order("created_at");

    if (error) {
        console.error("Erro ao listar:", error);
        lista.innerHTML = "<li>❌ Não foi possível carregar o time.</li>";
        return;
    }

    if (data.length === 0) {
        lista.innerHTML = "<li>Seu time está vazio. Busque um Pokémon e adicione!</li>";
        return;
    }

    lista.innerHTML = "";

    data.forEach(pokemon => {

        const item = document.createElement("li");
        item.className = "item-time";

        item.innerHTML = `
            <img src="${pokemon.imagem}" alt="${pokemon.nome}" width="56">
            <div class="info-time">
                <strong>${pokemon.nome}</strong>
                <small>#${pokemon.pokemon_id} · ${pokemon.tipos}</small>
            </div>
            <button class="btn-remover">Remover</button>
        `;

        item
            .querySelector(".btn-remover")
            .addEventListener("click", () => removerDoTime(pokemon.id));

        lista.appendChild(item);
    });
}

// ---------- DELETE: remover do banco ----------
async function removerDoTime(id) {

    const { error } = await supabase
        .from("favorito")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao remover:", error);
        return;
    }

    listarTime();
}

// ---------- Eventos ----------
document
    .getElementById("botao-buscar")
    .addEventListener("click", () => {

        const campo = document.getElementById("campo-busca");

        const nome = campo.value.toLowerCase().trim();

        if (nome) {
            buscarPokemon(nome);
        }

    });

// Carrega o time salvo assim que a página abre
listarTime();