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

            </div>
        `;

    } catch (erro) {

        resultado.innerHTML = `
            <p>
                ❌ Pokémon não encontrado.
                Tente outro nome ou número.
            </p>
        `;
    }
}


document
    .getElementById("botao-buscar")
    .addEventListener("click", () => {

        const campo = document.getElementById("campo-busca");

        const nome = campo.value.toLowerCase().trim();

        if (nome) {
            buscarPokemon(nome);
        }

    });