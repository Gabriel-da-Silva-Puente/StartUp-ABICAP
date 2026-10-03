/* PonteEscola - Página de Avisos */

(function () {

    const list =
        document.getElementById(
            "noticeList"
        );

    const search =
        document.getElementById(
            "inputBuscaAviso"
        );

    const filters =
        document.getElementById(
            "noticeFilters"
        );

    const modal =
        document.getElementById(
            "modalNovoAviso"
        );

    const form =
        document.getElementById(
            "formNovoAviso"
        );

    const openBtn =
        document.getElementById(
            "btnNovoAviso"
        );

    const closeBtn =
        document.getElementById(
            "modalClose"
        );

    const cancelBtn =
        document.getElementById(
            "modalCancel"
        );


    let activeFilter = "todos";


    /* =========================
       RENDERIZAR AVISOS
    ========================= */

    function render() {

        const query =
            (search?.value || "")
                .trim()
                .toLowerCase();


        const items =
            window
                .getAvisos()
                .filter(function (item) {

                    const matchesFilter =
                        activeFilter === "todos" ||
                        item.type === activeFilter;


                    const text =
                        `${item.title} ${item.message} ${item.type}`
                            .toLowerCase();


                    return (
                        matchesFilter &&
                        text.includes(query)
                    );

                });


        if (!items.length) {

            list.innerHTML = `
                <div class="empty-state">

                    Nenhum aviso encontrado.

                    <br>

                    <small>
                        Tente outro filtro ou termo de busca.
                    </small>

                </div>
            `;

            return;
        }


        list.innerHTML =
            items
                .map(function (item) {

                    return `

                        <article
                            class="notice-row"
                        >

                            <div>

                                <span class="notice-type">

                                    ${window.escapeHtml(
                                        item.type
                                    )}

                                    ${
                                        item.urgent
                                            ? " · Urgente"
                                            : ""
                                    }

                                </span>


                                <h3>

                                    ${window.escapeHtml(
                                        item.title
                                    )}

                                </h3>


                                <p>

                                    ${window.escapeHtml(
                                        item.message
                                    )}

                                </p>


                                <div
                                    class="notice-date"
                                >

                                    ${window.escapeHtml(
                                        item.date
                                    )}

                                </div>


                                <!-- BOTÃO EXCLUIR -->

                                <div
                                    class="notice-actions"
                                >

                                    <button
                                        type="button"
                                        class="delete-button"
                                        data-delete-notice="${item.id}"
                                    >

                                        🗑 Excluir aviso

                                    </button>

                                </div>

                            </div>


                            <div
                                class="notice-side"
                            >

                                <strong>

                                    ${window.escapeHtml(
                                        item.confirmations ||
                                        "0/22"
                                    )}

                                </strong>

                                <span>
                                    confirmações
                                </span>

                            </div>

                        </article>

                    `;

                })
                .join("");

    }


    /* =========================
       EXCLUIR AVISO
    ========================= */

    if (list) {

        list.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-delete-notice]"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.deleteNotice;


                const avisos =
                    window.getAvisos();


                const aviso =
                    avisos.find(
                        function (item) {

                            return (
                                String(item.id) ===
                                String(id)
                            );

                        }
                    );


                if (!aviso) {
                    return;
                }


                const confirmar =
                    window.confirm(
                        `Tem certeza que deseja excluir o aviso "${aviso.title}"?`
                    );


                if (!confirmar) {
                    return;
                }


                const novosAvisos =
                    avisos.filter(
                        function (item) {

                            return (
                                String(item.id) !==
                                String(id)
                            );

                        }
                    );


                window.saveAvisos(
                    novosAvisos
                );


                render();


                window.showToast(
                    "Aviso excluído."
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
                "avisoTitulo"
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
       BUSCA
    ========================= */

    if (search) {

        search.addEventListener(
            "input",
            render
        );

    }


    /* =========================
       NOVO AVISO
    ========================= */

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            openModal
        );

    }


    /* =========================
       FECHAR MODAL
    ========================= */

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
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
       CRIAR AVISO
    ========================= */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const titulo =
                    document
                        .getElementById(
                            "avisoTitulo"
                        )
                        .value
                        .trim();


                const tipo =
                    document
                        .getElementById(
                            "avisoTipo"
                        )
                        .value;


                const mensagem =
                    document
                        .getElementById(
                            "avisoMensagem"
                        )
                        .value
                        .trim();


                if (
                    !titulo ||
                    !tipo ||
                    !mensagem
                ) {

                    window.showToast(
                        "Preencha todos os campos."
                    );

                    return;

                }


                const items =
                    window.getAvisos();


                const now =
                    new Date();


                const date =
                    now.toLocaleDateString(
                        "pt-BR"
                    );


                const novoAviso = {

                    id:
                        String(
                            Date.now()
                        ),

                    title:
                        titulo,

                    type:
                        tipo,

                    message:
                        mensagem,

                    date:
                        date,

                    confirmations:
                        "0/22"

                };


                items.unshift(
                    novoAviso
                );


                window.saveAvisos(
                    items
                );


                closeModal();


                render();


                window.showToast(
                    "Aviso publicado e salvo."
                );

            }
        );

    }


    /* =========================
       INICIAR
    ========================= */

    render();

})();