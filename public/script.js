// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const startupsLink = document.getElementById("startups-link");
  const technologiesLink = document.getElementById("technologies-link");
  const cardsContainer = document.getElementById("cards-container");
  const sectionTitle = document.getElementById("section-title");

  // Modal Elements
  const editModal = document.getElementById("editModal");
  const closeButton = document.querySelector(".close-button");
  const editForm = document.getElementById("editForm");

  // URLs de las rutas del backend
  const READ_STARTUP_SERVICE_URL =
    "https://readstartupservice.onrender.com/api/startups/read";
  const DELETE_STARTUP_SERVICE_URL =
    "https://deletestartupservice.onrender.com/api/startups/delete";
  const UPDATE_STARTUP_SERVICE_URL =
    "https://updatestartupservice.onrender.com/api/startups/update";

  startupsLink.addEventListener("click", async (e) => {
    e.preventDefault();
    sectionTitle.textContent = "Startups";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    try {
      const response = await fetch(READ_STARTUP_SERVICE_URL);
      if (!response.ok) {
        throw new Error("Error al obtener las startups");
      }
      const data = await response.json();
      renderStartups(data);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = "<p>Error al cargar las startups.</p>";
    }
  });

  technologiesLink.addEventListener("click", async (e) => {
    e.preventDefault();
    sectionTitle.textContent = "Technologies";
    cardsContainer.innerHTML = "<p>Cargando...</p>";

    try {
      // Implementa la lógica similar para Technologies cuando lo necesites
      const response = await fetch("/api/technologies");
      if (!response.ok) {
        throw new Error("Error al obtener las technologies");
      }
      const data = await response.json();
      renderTechnologies(data);
    } catch (error) {
      console.error(error);
      cardsContainer.innerHTML = "<p>Error al cargar las technologies.</p>";
    }
  });

  // Función para renderizar Startups como tarjetas
  function renderStartups(startups) {
    cardsContainer.innerHTML = "";
    startups.forEach((startup) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${startup.nombre}</h3>
        <p><strong>Fecha de Fundación:</strong> ${formatDate(
          startup.fechaFundacion
        )}</p>
        <p><strong>Ubicación:</strong> ${startup.ubicacion}</p>
        <p><strong>Categoría:</strong> ${startup.categoria}</p>
        <p><strong>Inversión Recibida:</strong> $${
          startup.inversionRecibida
        }</p>
        <div class="buttons">
          <button class="edit-btn" data-id="${startup._id}">Editar</button>
          <button class="delete-btn" data-id="${startup._id}">Eliminar</button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // Añadir eventos a los botones de eliminar y editar
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
  }

  // Función para renderizar Technologies como tarjetas (puedes implementarlo similarmente)
  function renderTechnologies(technologies) {
    cardsContainer.innerHTML = "";
    technologies.forEach((tech) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${tech.nombre}</h3>
        <p><strong>Sector:</strong> ${tech.sector}</p>
        <p><strong>Descripción:</strong> ${tech.descripcion}</p>
        <p><strong>Estado de Adopción:</strong> ${tech.estadoAdopcion}</p>
        <p><strong>Fecha de Introducción:</strong> ${formatDate(
          tech.fechaIntroduccion
        )}</p>
        <div class="buttons">
          <button class="edit-btn" data-id="${tech._id}">Editar</button>
          <button class="delete-btn" data-id="${tech._id}">Eliminar</button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    // Añadir eventos a los botones de eliminar y editar
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
  }

  // Función para formatear fechas
  function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "Fecha inválida";
    return date.toLocaleDateString();
  }

  // Manejar la eliminación de una startup
  async function handleDelete(e) {
    const startupId = e.target.getAttribute("data-id");
    const confirmDelete = confirm(
      "¿Estás seguro de que quieres eliminar esta startup?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(DELETE_STARTUP_SERVICE_URL, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: startupId }), // Asegúrate de enviar _id
        });

        if (!response.ok) {
          throw new Error("Error al eliminar la startup");
        }

        const result = await response.json();
        alert(result.message || "Startup eliminada correctamente.");
        // Recargar las startups
        startupsLink.click();
      } catch (error) {
        console.error(error);
        alert("Hubo un error al eliminar la startup.");
      }
    }
  }

  // Manejar la edición de una startup
  function handleEdit(e) {
    const startupId = e.target.getAttribute("data-id");
    // Obtener los datos de la startup actual
    const card = e.target.closest(".card");
    const nombre = card.querySelector("h3").textContent;
    const fechaFundacionText = card.querySelector("p:nth-child(2)").textContent;
    const ubicacion = card
      .querySelector("p:nth-child(3)")
      .textContent.replace("Ubicación: ", "");
    const categoria = card
      .querySelector("p:nth-child(4)")
      .textContent.replace("Categoría: ", "");
    const inversionRecibidaText =
      card.querySelector("p:nth-child(5)").textContent;

    // Extraer la fecha de fundación y la inversión recibida
    const fechaFundacion = fechaFundacionText.replace(
      "Fecha de Fundación: ",
      ""
    );
    const inversionRecibida = inversionRecibidaText.replace(
      "Inversión Recibida: $",
      ""
    );

    // Rellenar el formulario del modal con los datos actuales
    editForm.nombre.value = nombre;
    editForm.ubicacion.value = ubicacion;
    editForm.categoria.value = categoria;
    editForm.inversionRecibida.value = inversionRecibida;
    editForm.startupId.value = startupId;

    // Mostrar el modal
    editModal.style.display = "block";
  }

  // Cerrar el modal al hacer clic en la "X"
  closeButton.addEventListener("click", () => {
    editModal.style.display = "none";
    editForm.reset();
  });

  // Cerrar el modal al hacer clic fuera del contenido del modal
  window.addEventListener("click", (event) => {
    if (event.target == editModal) {
      editModal.style.display = "none";
      editForm.reset();
    }
  });

  // Manejar la sumisión del formulario de edición
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const startupId = editForm.startupId.value;
    const nombre = editForm.nombre.value.trim();
    const ubicacion = editForm.ubicacion.value.trim();
    const categoria = editForm.categoria.value.trim();
    const inversionRecibida = parseFloat(editForm.inversionRecibida.value);

    // Validaciones básicas
    if (!nombre || !ubicacion || !categoria || isNaN(inversionRecibida)) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const updatedStartup = {
      _id: startupId, // Asegúrate de incluir la _id
      nombre,
      ubicacion,
      categoria,
      inversionRecibida,
    };

    try {
      const response = await fetch(
        `${UPDATE_STARTUP_SERVICE_URL}/${startupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedStartup),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la startup");
      }

      const result = await response.json();
      alert("Startup actualizada correctamente.");
      // Cerrar el modal y recargar las startups
      editModal.style.display = "none";
      editForm.reset();
      startupsLink.click();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar la startup.");
    }
  });
});
