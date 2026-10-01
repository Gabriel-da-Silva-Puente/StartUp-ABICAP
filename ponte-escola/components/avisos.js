const notices = [

    {
        id: 1,

        title:
            "Reunião de Pais — 20/09",

        description:
            "Convocamos todos os responsáveis para a reunião de pais na próxima sexta-feira, às 18h.",

        type: "aviso",

        date: "10/09/2026",

        reads: 19,

        total: 22
    },

    {
        id: 2,

        title:
            "Lista de material atualizada",

        description:
            "A lista de material escolar foi atualizada. Acesse o documento completo para conferir as alterações.",

        type: "comunicado",

        date: "09/09/2026",

        reads: 22,

        total: 22
    },

    {
        id: 3,

        title:
            "Passeio ao Zoológico — autorização pendente",

        description:
            "Precisamos da autorização dos responsáveis para o passeio do dia 25/09.",

        type: "autorizacao",

        date: "08/09/2026",

        reads: 14,

        total: 22,

        urgent: true
    },

    {
        id: 4,

        title:
            "Feira Cultural da Escola",

        description:
            "Na próxima semana teremos nossa feira cultural. Em breve enviaremos mais informações.",

        type: "evento",

        date: "06/09/2026",

        reads: 18,

        total: 22
    },

    {
        id: 5,

        title:
            "Atividade especial de leitura",

        description:
            "Durante esta semana faremos atividades especiais relacionadas à leitura e contação de histórias.",

        type: "atividade",

        date: "05/09/2026",

        reads: 20,

        total: 22
    },

    {
        id: 6,

        title:
            "Alteração no horário de saída",

        description:
            "Nesta sexta-feira a saída acontecerá excepcionalmente às 16h30.",

        type: "aviso",

        date: "04/09/2026",

        reads: 22,

        total: 22
    }

];


const noticeList =
    document.getElementById(
        "notice-list"
    );

const searchInput =
    document.getElementById(
        "input-busca-aviso"
    );

const modalNewNotice =
    document.getElementById(
        "modal-novo-aviso"
    );

const modalDetailNotice =
    document.getElementById(
        "modal-detalhes-aviso"
    );

const formNewNotice =
    document.getElementById(
        "form-novo-aviso"
    );

const toast =
    document.getElementById(
        "toast"
    );


let selectedType = "todos";


/* =========================================
   NAVEGAÇÃO
========================================= */

function setupNavigation() {

    document
        .getElementById(
            "btn-nav-inicio"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "pglinicial.html";

            }
        );


    document
        .getElementById(
            "btn-nav-atividades"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "atividades.html";

            }
        );


    document
        .getElementById(
            "btn-nav-avisos"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "avisos.html";

            }
        );


    document
        .getElementById(
            "btn-nav-ocorrencias"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Ocorrências ainda está em desenvolvimento."
                );

            }
        );


    document
        .getElementById(
            "btn-nav-autorizacoes"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Autorizações ainda está em desenvolvimento."
                );

            }
        );


    document
        .getElementById(
            "btn-nav-mural"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Mural da Turma ainda está em desenvolvimento."
                );

            }
        );


    document
        .getElementById(
            "btn-nav-perfil"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Perfil ainda está em desenvolvimento."
                );

            }
        );


    document
        .getElementById(
            "btn-nav-sair"
        )
        ?.addEventListener(
            "click",
            () => {

                const sair =
                    confirm(
                        "Deseja realmente sair?"
                    );

                if (sair) {

                    window.location.href =
                        "pglinicial.html";

                }

            }
        );

}


/* =========================================
   TURMAS
========================================= */

const btnClassSelector =
    document.getElementById(
        "btn-class-selector"
    );

const classMenu =
    document.getElementById(
        "class-menu"
    );

const classLabel =
    document.getElementById(
        "class-label"
    );


btnClassSelector?.addEventListener(
    "click",
    () => {

        classMenu.hidden =
            !classMenu.hidden;

    }
);


document
    .querySelectorAll(
        "#class-menu button"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    classLabel.textContent =
                        button.dataset.class;

                    classMenu.hidden =
                        true;

                }
            );

        }
    );


/* =========================================
   TIPO
========================================= */

function getTypeName(type) {

    const names = {

        aviso: "Aviso",

        comunicado: "Comunicado",

        evento: "Evento",

        atividade: "Atividade",

        autorizacao: "Autorização"

    };

    return names[type] ||
        "Aviso";
}


/* =========================================
   RENDER
========================================= */

function renderNotices() {

    if (!noticeList) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        notices.filter(
            (notice) => {

                const matchesSearch =
                    notice.title
                        .toLowerCase()
                        .includes(search) ||

                    notice.description
                        .toLowerCase()
                        .includes(search);


                const matchesType =
                    selectedType === "todos" ||
                    notice.type ===
                        selectedType;


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    if (filtered.length === 0) {

        noticeList.innerHTML = `
            <div class="notice-empty">
                Nenhum aviso encontrado.
            </div>
        `;

        return;
    }


    noticeList.innerHTML =
        filtered
            .map(
                (notice) => {

                    const confirmed =
                        notice.reads ===
                        notice.total;


                    let tagClass =
                        "tag-notice";


                    if (
                        notice.type ===
                        "comunicado"
                    ) {

                        tagClass =
                            "tag-communicado";

                    }


                    if (
                        notice.type ===
                        "evento"
                    ) {

                        tagClass =
                            "tag-event";

                    }


                    if (
                        notice.type ===
                        "atividade"
                    ) {

                        tagClass =
                            "tag-activity";

                    }


                    if (
                        notice.type ===
                        "autorizacao"
                    ) {

                        tagClass =
                            "tag-autorizacao";

                    }


                    return `

                        <article
                            class="notice-card"
                            data-notice-id="${notice.id}"
                        >

                            <div class="notice-main">

                                <div class="notice-tags">

                                    <span
                                        class="tag ${tagClass}"
                                    >
                                        ${getTypeName(
                                            notice.type
                                        )}
                                    </span>


                                    ${
                                        notice.urgent
                                            ? `
                                                <span class="tag tag-urgent">
                                                    Urgente
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>


                                <h3 class="notice-title">
                                    ${notice.title}
                                </h3>


                                <p class="notice-description">
                                    ${notice.description}
                                </p>


                                <time class="notice-date">
                                    ${notice.date}
                                </time>

                            </div>


                            <div
                                class="
                                    notice-meta
                                    ${
                                        confirmed
                                            ? "confirmed"
                                            : ""
                                    }
                                "
                            >

                                <strong>
                                    ${
                                        confirmed
                                            ? "✓"
                                            : "◷"
                                    }

                                    ${notice.reads}/${notice.total}
                                </strong>

                                <span>
                                    confirmações
                                </span>

                                <div class="notice-arrow">
                                    ›
                                </div>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    document
        .querySelectorAll(
            ".notice-card"
        )
        .forEach(
            (card) => {

                card.addEventListener(
                    "click",
                    () => {

                        openNoticeDetails(
                            Number(
                                card.dataset
                                    .noticeId
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================
   DETALHES
========================================= */

function openNoticeDetails(id) {

    const notice =
        notices.find(
            (item) =>
                item.id === id
        );


    if (!notice) {
        return;
    }


    const content =
        document.getElementById(
            "notice-detail-content"
        );


    content.innerHTML = `

        <h2>
            ${notice.title}
        </h2>

        <p>
            ${notice.description}
        </p>

        <br>

        <p>
            <strong>Tipo:</strong>
            ${getTypeName(
                notice.type
            )}
        </p>

        <p>
            <strong>Publicado em:</strong>
            ${notice.date}
        </p>

        <p>
            <strong>Confirmações:</strong>
            ${notice.reads}/${notice.total}
        </p>

    `;


    modalDetailNotice.hidden =
        false;

}


/* =========================================
   FILTROS
========================================= */

document
    .querySelectorAll(
        ".notice-filter"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".notice-filter"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedType =
                        button.dataset.type;


                    renderNotices();

                }
            );

        }
    );


/* =========================================
   NOVO AVISO
========================================= */

document
    .getElementById(
        "btn-novo-aviso"
    )
    ?.addEventListener(
        "click",
        () => {

            modalNewNotice.hidden =
                false;

        }
    );


/* =========================================
   FORMULÁRIO
========================================= */

formNewNotice?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const title =
            document
                .getElementById(
                    "input-titulo-aviso"
                )
                .value
                .trim();


        const type =
            document
                .getElementById(
                    "select-tipo-aviso"
                )
                .value;


        const message =
            document
                .getElementById(
                    "input-mensagem-aviso"
                )
                .value
                .trim();


        if (
            !title ||
            !type ||
            !message
        ) {

            return;

        }


        notices.unshift({

            id: Date.now(),

            title,

            description:
                message,

            type,

            date:
                new Date()
                    .toLocaleDateString(
                        "pt-BR"
                    ),

            reads: 0,

            total: 22

        });


        formNewNotice.reset();


        modalNewNotice.hidden =
            true;


        renderNotices();


        showToast(
            "Aviso publicado com sucesso!"
        );

    }
);


/* =========================================
   FECHAR MODAIS
========================================= */

document
    .getElementById(
        "btn-fechar-novo-aviso"
    )
    ?.addEventListener(
        "click",
        () => {

            modalNewNotice.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-cancelar-aviso"
    )
    ?.addEventListener(
        "click",
        () => {

            modalNewNotice.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-fechar-detalhes-aviso"
    )
    ?.addEventListener(
        "click",
        () => {

            modalDetailNotice.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-fechar-detalhes"
    )
    ?.addEventListener(
        "click",
        () => {

            modalDetailNotice.hidden =
                true;

        }
    );


/* =========================================
   CLIQUE FORA
========================================= */

modalNewNotice?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalNewNotice
        ) {

            modalNewNotice.hidden =
                true;

        }

    }
);


modalDetailNotice?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalDetailNotice
        ) {

            modalDetailNotice.hidden =
                true;

        }

    }
);


/* =========================================
   ESC
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            if (modalNewNotice) {

                modalNewNotice.hidden =
                    true;

            }

            if (modalDetailNotice) {

                modalDetailNotice.hidden =
                    true;

            }

        }

    }
);


/* =========================================
   BUSCA
========================================= */

searchInput?.addEventListener(
    "input",
    renderNotices
);


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

setupNavigation();

renderNotices();