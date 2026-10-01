document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       NAVEGAÇÃO LATERAL
    ===================================================== */

    const navItems = document.querySelectorAll(
        ".nav-item[data-section]"
    );

    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            const section = item.dataset.section;

            /*
             * Início
             */
            if (section === "inicio") {
                window.location.href = "pglinicial.html";
                return;
            }

            /*
             * Atividades
             */
            if (section === "atividades") {
                window.location.href = "atividades.html";
                return;
            }

            /*
             * Avisos
             */
            if (section === "avisos") {
                window.location.href = "avisos.html";
                return;
            }

            /*
             * Outras páginas ainda não implementadas
             */
            const label =
                item.querySelector("span:last-child")?.textContent ||
                "Esta seção";

            showToast(`${label} ainda está em desenvolvimento.`);
        });

    });


    /* =====================================================
       PERFIL
    ===================================================== */

    const profileBtn =
        document.getElementById("profileBtn");

    profileBtn?.addEventListener("click", () => {

        showToast(
            "A página de perfil ainda está em desenvolvimento."
        );

    });


    /* =====================================================
       SAIR
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    logoutBtn?.addEventListener("click", () => {

        const sair = confirm(
            "Deseja realmente sair?"
        );

        if (sair) {
            window.location.href = "../index.html";
        }

    });


    /* =====================================================
       SELETOR DE TURMA
    ===================================================== */

    const classSelector =
        document.getElementById("classSelector");

    const classMenu =
        document.getElementById("classMenu");

    const classLabel =
        document.getElementById("classLabel");

    const headingClass =
        document.getElementById("headingClass");

    const sectionSubtitle =
        document.getElementById("sectionSubtitle");


    classSelector?.addEventListener("click", () => {

        if (!classMenu) {
            return;
        }

        const isOpen =
            !classMenu.hidden;

        classMenu.hidden = isOpen;

        classSelector.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

    });


    /*
     * Selecionar uma turma
     */

    classMenu?.querySelectorAll("button").forEach((button) => {

        button.addEventListener("click", () => {

            const selectedClass =
                button.dataset.class;

            if (!selectedClass) {
                return;
            }

            if (classLabel) {
                classLabel.textContent =
                    selectedClass;
            }

            if (headingClass) {
                headingClass.textContent =
                    selectedClass;
            }

            if (sectionSubtitle) {
                sectionSubtitle.textContent =
                    `Acompanhe a vida escolar do seu filho na turma ${selectedClass}.`;
            }

            classMenu.hidden = true;

            classSelector?.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });


    /*
     * Fechar menu clicando fora
     */

    document.addEventListener("click", (event) => {

        if (
            !classSelector?.contains(event.target) &&
            !classMenu?.contains(event.target)
        ) {

            if (classMenu) {
                classMenu.hidden = true;
            }

            classSelector?.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* =====================================================
       CARDS DE ESTATÍSTICAS
    ===================================================== */

    const statCards =
        document.querySelectorAll(".stat-card");


    statCards.forEach((card) => {

        card.addEventListener("click", () => {

            const filter =
                card.dataset.filter;


            if (filter === "atividades") {

                window.location.href =
                    "atividades.html";

                return;
            }


            if (filter === "avisos") {

                window.location.href =
                    "avisos.html";

                return;
            }


            if (filter === "ocorrencias") {

                showToast(
                    "A área de ocorrências ainda está em desenvolvimento."
                );

                return;
            }


            if (filter === "pendencias") {

                showToast(
                    "Você possui 2 pendências para conferir."
                );

            }

        });

    });


    /* =====================================================
       AVISOS
    ===================================================== */

    const noticeRows =
        document.querySelectorAll(".notice-row");


    noticeRows.forEach((notice) => {

        notice.addEventListener("click", () => {

            const title =
                notice.dataset.title ||
                "Aviso";

            showModal(
                "Aviso",
                title
            );

        });

    });


    /* =====================================================
       VER TODOS OS AVISOS
    ===================================================== */

    const viewAllBtn =
        document.getElementById("viewAllBtn");


    viewAllBtn?.addEventListener("click", () => {

        window.location.href =
            "avisos.html";

    });


    /* =====================================================
       NOTIFICAÇÕES
    ===================================================== */

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );


    notificationBtn?.addEventListener("click", () => {

        showToast(
            "Você possui 2 novas notificações."
        );

    });


    /* =====================================================
       AVATAR
    ===================================================== */

    const avatarBtn =
        document.getElementById("avatarBtn");


    avatarBtn?.addEventListener("click", () => {

        showToast(
            "A página de perfil ainda está em desenvolvimento."
        );

    });


    /* =====================================================
       CARDS DE ACESSO RÁPIDO
    ===================================================== */

    const quickCards =
        document.querySelectorAll(
            ".quick-card[data-section]"
        );


    quickCards.forEach((card) => {

        card.addEventListener("click", () => {

            const section =
                card.dataset.section;


            if (section === "atividades") {

                window.location.href =
                    "atividades.html";

                return;
            }


            if (section === "avisos") {

                window.location.href =
                    "avisos.html";

                return;
            }


            showToast(
                "Esta seção ainda está em desenvolvimento."
            );

        });

    });


    /* =====================================================
       MODAL
    ===================================================== */

    const modalBackdrop =
        document.getElementById(
            "modalBackdrop"
        );

    const modalClose =
        document.getElementById(
            "modalClose"
        );

    const modalOk =
        document.getElementById(
            "modalOk"
        );

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );

    const modalText =
        document.getElementById(
            "modalText"
        );


    function showModal(title, text) {

        if (!modalBackdrop) {
            return;
        }

        if (modalTitle) {
            modalTitle.textContent =
                title;
        }

        if (modalText) {
            modalText.textContent =
                text;
        }

        modalBackdrop.hidden = false;

    }


    function closeModal() {

        if (modalBackdrop) {
            modalBackdrop.hidden = true;
        }

    }


    modalClose?.addEventListener(
        "click",
        closeModal
    );


    modalOk?.addEventListener(
        "click",
        closeModal
    );


    modalBackdrop?.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                modalBackdrop
            ) {
                closeModal();
            }

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeModal();
            }

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        const toast =
            document.getElementById("toast");

        if (!toast) {
            return;
        }

        toast.textContent = message;

        toast.classList.add("show");


        clearTimeout(
            window.toastTimeout
        );


        window.toastTimeout =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);

    }

});