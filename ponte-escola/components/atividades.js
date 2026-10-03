/* PonteEscola - Página de Atividades */

(function () {

    const key =
        "ponteEscolaAtividades";


    const defaults = [

        {
            id: "1",
            title: "Pintura com guache",
            description:
                "Atividade artística com mistura de cores e exploração de diferentes pincéis.",
            date: "18/09/2026",
            status: "Em andamento"
        },

        {
            id: "2",
            title: "Contação de histórias",
            description:
                "Leitura coletiva seguida de conversa sobre personagens e acontecimentos.",
            date: "19/09/2026",
            status: "Pendente"
        },

        {
            id: "3",
            title: "Formas geométricas",
            description:
                "Identificação e montagem de figuras usando blocos e materiais da sala.",
            date: "12/09/2026",
            status: "Concluída"
        },

        {
            id: "4",
            title: "Música e movimento",
            description:
                "Atividade corporal com ritmo, coordenação e participação em grupo.",
            date: "22/09/2026",
            status: "Pendente"
        },

        {
            id: "5",
            title: "Horta da turma",
            description:
                "Observação das plantas e registro das mudanças ao longo da semana.",
            date: "24/09/2026",
            status: "Em andamento"
        },

        {
            id: "6",
            title: "Meu autorretrato",
            description:
                "Produção de autorretrato para o mural da turma.",
            date: "10/09/2026",
            status: "Concluída"
        }

    ];


    /* =========================
       PEGAR ATIVIDADES
    ========================= */

    function get() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        key
                    )
                );


            if (
                Array.isArray(saved)
            ) {

                return saved;

            }

        } catch (error) {

            console.log(
                "Erro ao carregar atividades:",
                error
            );

        }


        localStorage.setItem(
            key,
            JSON.stringify(defaults)
        );


        return defaults;

    }


    /* =========================
       SALVAR
    ========================= */

    function save(items) {

        localStorage.setItem(
            key,
            JSON.stringify(items)
        );

    }


    const list =
        document.getElementById(
            "activityList"
        );

    const search =
        document.getElementById(
            "inputBuscaAtividade"
        );

    const filters =
        document.getElementById(
            "activityFilters"
        );

    const modal =
        document.getElementById(
            "modalNovaAtividade"
        );

    const form =
        document.getElementById(
            "formNovaAtividade"
        );


    let activeFilter =
        "Todas";


    /* =========================
       STATUS
    ========================= */

    function statusClass(
        status
    ) {

        if (
            status === "Concluída"
        ) {

            return "status-concluida";

        }


        if (
            status === "Em andamento"
        ) {

            return "status-andamento";

        }


        return "status-pendente";

    }


    /* =========================
       RENDERIZAR
    ========================= */

    function render() {

        const query =
            (
                search?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const all =
            get();


        const items =
            all.filter(
                function (item) {

                    const matchesFilter =
                        activeFilter === "Todas" ||
                        item.status === activeFilter;


                    const text =
                        `${item.title} ${item.description}`
                            .toLowerCase();


                    return (
                        matchesFilter &&
                        text.includes(query)
                    );

                }
            );


        /* CONTADORES */

        document.getElementById(
            "totalAtividades"
        ).textContent =
            all.length;


        document.getElementById(
            "andamentoAtividades"
        ).textContent =
            all.filter(
                function (item) {

                    return (
                        item.status ===
                        "Em andamento"
                    );

                }
            ).length;


        document.getElementById(
            "concluidasAtividades"
        ).textContent =
            all.filter(
                function (item) {

                    return (
                        item.status ===
                        "Concluída"
                    );

                }
            ).length;


        /* NENHUM RESULTADO */

        if (!items.length) {

            list.innerHTML = `

                <div
                    class="empty-state"
                    style="grid-column:1/-1"
                >

                    Nenhuma atividade
                    encontrada.

                </div>

            `;

            return;

        }


        /* CARDS */

        list.innerHTML =
            items
                .map(function (item) {

                    return `

                        <article
                            class="activity-card"
                        >

                            <div
                                class="activity-top"
                            >

                                <span
                                    class="
                                        status-badge
                                        ${statusClass(
                                            item.status
                                        )}
                                    "
                                >

                                    ${window.escapeHtml(
                                        item.status
                                    )}

                                </span>


                                <span
                                    style="
                                        color:#8b98aa;
                                        font-size:12px;
                                    "
                                >

                                    Jardim II

                                </span>

                            </div>


                            <h3>

                                ${window.escapeHtml(
                                    item.title
                                )}

                            </h3>


                            <p>

                                ${window.escapeHtml(
                                    item.description
                                )}

                            </p>


                            <div
                                class="activity-footer"
                            >

                                <span>
                                    Entrega
                                </span>

                                <strong>

                                    ${window.escapeHtml(
                                        item.date
                                    )}

                                </strong>

                            </div>


                            <!-- BOTÃO EXCLUIR -->

                            <div
                                class="activity-actions"
                            >

                                <button
                                    type="button"
                                    class="delete-button"
                                    data-delete-activity="${item.id}"
                                >

                                    🗑 Excluir atividade

                                </button>

                            </div>

                        </article>

                    `;

                })
                .join("");

    }


    /* =========================
       EXCLUIR ATIVIDADE
    ========================= */

    if (list) {

        list.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-delete-activity]"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.deleteActivity;


                const atividades =
                    get();


                const atividade =
                    atividades.find(
                        function (item) {

                            return (
                                String(item.id) ===
                                String(id)
                            );

                        }
                    );


                if (!atividade) {
                    return;
                }


                const confirmar =
                    window.confirm(
                        `Tem certeza que deseja excluir a atividade "${atividade.title}"?`
                    );


                if (!confirmar) {
                    return;
                }


                const novasAtividades =
                    atividades.filter(
                        function (item) {

                            return (
                                String(item.id) !==
                                String(id)
                            );

                        }
                    );


                save(
                    novasAtividades
                );


                render();


                window.showToast(
                    "Atividade excluída."
                );

            }
        );

    }


    /* =========================
       ABRIR MODAL
    ========================= */

    function openModal() {

        if (!modal) {
            return;
        }


        modal.hidden = false;


        const title =
            document.getElementById(
                "atividadeTitulo"
            );


        if (title) {

            setTimeout(
                function () {

                    title.focus();

                },
                50
            );

        }

    }


    /* =========================
       FECHAR MODAL
    ========================= */

    function closeModal() {

        if (!modal) {
            return;
        }


        modal.hidden = true;


        if (form) {

            form.reset();

        }

    }


    /* =========================
       NOVA ATIVIDADE
    ========================= */

    const newButton =
        document.getElementById(
            "btnNovaAtividade"
        );


    if (newButton) {

        newButton.addEventListener(
            "click",
            openModal
        );

    }


    /* =========================
       FECHAR MODAL
    ========================= */

    const closeButton =
        document.getElementById(
            "activityModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    const cancelButton =
        document.getElementById(
            "activityModalCancel"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.hidden
            ) {

                closeModal();

            }

        }
    );


    /* =========================
       BUSCA
    ========================= */

    if (search) {

        search.addEventListener(
            "input",
            render
        );

    }


    /* =========================
       FILTROS
    ========================= */

    if (filters) {

        filters.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-filter]"
                    );


                if (!button) {
                    return;
                }


                activeFilter =
                    button.dataset.filter;


                filters
                    .querySelectorAll(
                        ".filter-tab"
                    )
                    .forEach(
                        function (item) {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        }
                    );


                render();

            }
        );

    }


    /* =========================
       CRIAR ATIVIDADE
    ========================= */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const titulo =
                    document
                        .getElementById(
                            "atividadeTitulo"
                        )
                        .value
                        .trim();


                const descricao =
                    document
                        .getElementById(
                            "atividadeDescricao"
                        )
                        .value
                        .trim();


                const rawDate =
                    document
                        .getElementById(
                            "atividadeData"
                        )
                        .value;


                if (
                    !titulo ||
                    !descricao ||
                    !rawDate
                ) {

                    window.showToast(
                        "Preencha todos os campos."
                    );

                    return;

                }


                const date =
                    new Date(
                        `${rawDate}T00:00:00`
                    ).toLocaleDateString(
                        "pt-BR"
                    );


                const items =
                    get();


                items.unshift({

                    id:
                        String(
                            Date.now()
                        ),

                    title:
                        titulo,

                    description:
                        descricao,

                    date:
                        date,

                    status:
                        "Pendente"

                });


                save(items);


                closeModal();


                render();


                window.showToast(
                    "Atividade criada e salva."
                );

            }
        );

    }


    /* =========================
       INICIAR
    ========================= */

    render();

})();