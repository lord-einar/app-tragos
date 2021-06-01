/*!
 * Start Bootstrap - Resume v7.0.0 (https://startbootstrap.com/theme/resume)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
 */
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    let carrito = []

    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        $('#finalizar-compra').prop('disabled', false);
    } else {
        carrito = []
        $('#finalizar-compra').prop('disabled', true);
    }

    if (carrito != []) {
        cargarCarrito()
    }


    document.getElementById('mostrar-carrito').addEventListener("click", () => {
        modal()
    })

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Capturar tipo de trago
    document.getElementById('btn-buscar').addEventListener('click', async () => {
        let busqueda = document.getElementById('buscar').value
        console.log(busqueda)
        tragos = await buscarTragos(busqueda)
        console.log(tragos)
        mostrarTragos(tragos)
    })

    const buscarTragos = async (tragoBuscar) => {
        const busqueda = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${tragoBuscar}`)
        const busquedaJson = await busqueda.json()
        const trago = busquedaJson.drinks.map(el => {
            return {
                idTrago: el.idDrink,
                nombre: el.strDrink,
                imagen: el.strDrinkThumb,
            }
        })
        return trago
    }

    const buscarTrago = async (idTrago) => {
        const busqueda = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idTrago}`)
        const busquedaJson = await busqueda.json()
        const trago = await busquedaJson.drinks.map(el => {
            let ingredientes = []
            for (const propiedad in el) {
                if (propiedad.includes('strIngre') && (el[propiedad] != null)) {
                    let imagen = `https://www.thecocktaildb.com/images/ingredients/${el[propiedad]}-Small.png`
                    ingredientes.push({
                        nombre: el[propiedad],
                        imagen: imagen
                    })
                }
            }

            res = {
                idTrago: el.idDrink,
                nombre: el.strDrink,
                imagen: el.strDrinkThumb,
                ingredientes: ingredientes,
                instrucciones: el.strInstructions
            }

            return res
        })
        return trago
    }

    const mostrarTragos = (lista) => {
        let listaTragos = ''
        let selectTragos = document.getElementById('tragos')
        selectTragos.innerHTML = ''

        for (const trago of lista) {
            listaTragos += `
            <div class="trago" id="${trago.idTrago}">
                <img class="img-trago" src=${trago.imagen}>
            <div class="card-body">
                <h5 class="">${trago.nombre}</h5>
                <a href='#elaboracion' class='btn btn-danger btn-trago' id="${trago.idTrago}">SELECCIONAR</a>
            </div>
            </div>`
        }

        selectTragos.innerHTML = listaTragos

        document.querySelectorAll(".btn-trago").forEach(el => {
            el.addEventListener("click", async e => {
                let trago = await buscarTrago(e.target.id)
                mostrarTrago(trago)
            })
        })
    }

    const mostrarTrago = async (trago) => {
        // Llenar la informacion
        let infoTrago = document.getElementById('infoTrago')
        let Info = ''

        for (const data of trago) {

            //Traducir las instrucciones
            let instruccionEspanol = await traducir(data.instrucciones)
            let ingrdienteEspanol = []
            // Traducir los ingredientes
            for (const ing of data.ingredientes) {
                ingrdienteEspanol.push({
                    nombre: await traducir(ing.nombre),
                    imagen: ing.imagen
                })
            }
            data.ingredientes = ingrdienteEspanol

            //Llenar la tabla
            Info += `<h2>Elaboracion de ${data.nombre}</h2>
                     <p class="elaboracion">${instruccionEspanol}</p>
                     <div class="ingredientes">
                        ${data.ingredientes.map(el => `
                            <div class="ingrediente">
                                <img src='${el.imagen}'>
                                <div>
                                    <p>${el.nombre}</p>
                                    <a href='#compra-ingredientes' class='btn btn-danger btn-ingrediente' id="${el.nombre}">SELECCIONAR</a>
                                </div>
                            </div>`).join('')}
                        </div>`

            infoTrago.innerHTML = Info

            document.querySelectorAll(".btn-ingrediente").forEach(el => {
                el.addEventListener("click", async e => {
                    console.log(e.target.id)
                    let trago = await listaProductosML(e.target.id)
                    mostrarProductosML(trago)
                })
            })
        }

    }

    // Traer articulos de Mercadolibre
    const listaProductosML = async (producto) => {
        let buscarProducto = encodeURIComponent(producto)

        let productos = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${buscarProducto}`, {
            headers: {
                Authorization: "Bearer EiqG4RJkxA2xIHbcijRFjEoybge68sy9"
            }
        })
        const busquedaJson = await productos.json()
        console.log(busquedaJson)
        let datosProductos = []
        for (let i = 0; i < 20; i++) {
            let producto
            busquedaJson.results[i]
            producto = {
                id: busquedaJson.results[i].id,
                nombre: busquedaJson.results[i].title,
                imagen: busquedaJson.results[i].thumbnail,
                precio: busquedaJson.results[i].price,
                cantidadDisponible: busquedaJson.results[i].available_quantity
            }
            datosProductos.push(producto)
        }
        return datosProductos
    }


    // Mostrar articulos de Mercado Libre
    const mostrarProductosML = async (lista) => {
        let mostrarIngredientes = ''
        document.getElementById('venta-ingredientes').innerHTML = ''
        // $('#venta-ingredientes').html('')

        for (let item of lista) {

            mostrarIngredientes = document.createElement('div')
            mostrarIngredientes.className = 'card mb-3'
            mostrarIngredientes.style.maxWidth = '540px'

            mostrarIngredientes.innerHTML = `<div class="row no-gutters">
          <div class="col mb-4">
            <img class="imagen-bebida" src="${item.imagen}" alt="...">
          </div>
          <div class="col-md-10">
            <div class="card-body">
              <p class="card-text">${item.nombre}</p>
              <p class="card-text">Precio $${item.precio}</p>
              <p class="card-text">Disponibles: ${item.stock}</p>
              <label>Cantidad</label>
              <p>
              <a class='${item.id}' id='restar'><i class="fas fa-minus ${item.id}"></i></a>
              <input type="text" size="2" id='cantidad${item.id}' value='1'></input>
              <a class='${item.id}' id='sumar'><i class="fas fa-plus ${item.id}"></i></a>
              </p>
              <p class="card-text"><button class="btn btn-danger" id="btn-comprar" ingrediente="${item.id}">COMPRAR</button></p>
            </div>
          </div>
        </div>`

            document.getElementById('venta-ingredientes').append(mostrarIngredientes)
        }

        // CAPTURAR COMPRA
        document.querySelectorAll("#btn-comprar").forEach(el => {
            el.addEventListener("click", e => {
                let articuloComprado = e.target.getAttribute("ingrediente");
                let objetoComprado = lista.find(el => el.id == articuloComprado)
                let cantidadComprada = Number(document.getElementById(`cantidad${objetoComprado.id}`).value)
                objetoComprado.cantidad = cantidadComprada
                console.log(objetoComprado)
                agregarCarrito(objetoComprado)
            });
        });

        // RESTAR CANTIDAD
        document.querySelectorAll("#restar").forEach(el => {
            el.addEventListener("click", e => {
                const articulo = e.target.parentNode.className;
                cambiarCantidad('restar', articulo)
            });
        });

        //SUMAR CANTIDAD
        document.querySelectorAll("#sumar").forEach(el => {
            el.addEventListener("click", e => {
                const articulo = (e.target.parentNode.className)
                cambiarCantidad('sumar', articulo)
            });
        });

        //CAMBIAR NUMERO DE CANTIDAD COMPRADA
        function cambiarCantidad(operacion, art) {

            let cantidad = Number($(`#cantidad${art}`).val())
            console.log('Actual ', cantidad)

            if (operacion == 'restar')
                cantidad = cantidad - 1
            else {
                cantidad = cantidad + 1
            }
            $(`#cantidad${art}`).val(cantidad)

        }
    }



    // Traducir texto a español
    const traducir = async (textoATraducir) => {

        let key = "AIzaSyBkTMtA8vtYT02neobNTivJfPulrr23Jds"

        data = {
            "q": textoATraducir,
            "source": "en",
            "target": "es",
            "format": "text",
        }

        let traduccion = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
        res = await traduccion.json()
        return res.data.translations[0].translatedText
    }


    //AGREGAR ARTICULO AL CARRITO
    function agregarCarrito(objetoCarrito) {

        // Busco el producto dentro de la variable Carrito
        let yaComprado = carrito.find(el => el.id == objetoCarrito.id)
        if (yaComprado) {
            // Si lo encuentra, suma sus propiedades de cantidad
            yaComprado.cantidad += objetoCarrito.cantidad
        } else {
            // Si no lo encuentra, agrega un nuevo elemento al carrito
            carrito.push(objetoCarrito)
        }

        localStorage.setItem('carrito', JSON.stringify(carrito))
        $('#finalizar-compra').prop('disabled', false);
        cargarCarrito()

    }

    //QUITAR ARTICULO DEL CARRITO
    function quitarDelCarrito(id) {

        let removerArt = carrito.indexOf(carrito.find(el => el.id == id))
        carrito.splice(removerArt, 1)
        localStorage.setItem('carrito', JSON.stringify(carrito))
        let productosCarrito = document.querySelector('.producto')
        productosCarrito.parentNode.removeChild(productosCarrito)
        cargarCarrito()

    }

    //DIBUJAR EL CARRITO
    function cargarCarrito() {
        let productosEnCarrito = ''
        $('#carrito').html('')
        let totalCarrito = 0
        let numeroCarrito = 0

        for (let productoCarrito of carrito) {
            let totalProducto = productoCarrito.precio * productoCarrito.cantidad

            productosEnCarrito = document.createElement('div')
            productosEnCarrito.className = 'card border-success dropdown-item producto'

            productosEnCarrito.innerHTML = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                    <img src="${productoCarrito.imagen}" alt="...">
                    </div>
                    <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${productoCarrito.nombre}</h5>
                        <p class="card-text">Cantidad: ${productoCarrito.cantidad}</p>
                        <p class="card-text">Precio $${totalProducto}</p>
                        <button class='btn btn-danger remover' id="${productoCarrito.id}">Quitar del carrito</button>
                    </div>
                    </div>
                </div>
            </div>`

            totalCarrito += totalProducto
            numeroCarrito += 1

            $('#carrito').append(productosEnCarrito)
        }

        $('#numero-carrito').html(numeroCarrito)
        $('#total-carrito').html(`Total de la compra $${totalCarrito}`)

        document.querySelectorAll(".remover").forEach(el => {
            el.addEventListener("click", e => {
                quitarDelCarrito(e.target.id)
            });
        });
    }


    document.getElementById('finalizar-compra').addEventListener("click", () => {

        generarLinkDePago()
       
    })

    async function generarLinkDePago() {
          const productsToMP = carrito.map((element) => {
            let nuevoElemento = {
              title: element.nombre,
              description: "",
              picture_url: "",
              category_id:element.id,
              quantity: Number(element.cantidad),
              currency_id: "ARS",
              unit_price: Number(element.precio),
            };
            return nuevoElemento;
          });
          console.log(productsToMP);
          const response = await fetch(
            "https://api.mercadopago.com/checkout/preferences",
            {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer TEST-4030376229634508-053121-d3c93e21a2b01d6259f7a47988844a28-55933383",
              },
              body: JSON.stringify({
                items: productsToMP,
              }),
            }
          );
          const data = await response.json();
            // console.log(data)
          window.open(data.init_point, "_blank");
        }


    // MODAL

    function modal() {
        var id = "#modal-inicial";


        //Mascara de fondo que ocupa toda la pantalla
        $('#mask').css({
            'width': $(window).width(),
            'height': $(document).height()
        });

        //Efecto de aparicion de mascara             
        $('#mask').fadeIn(1000);
        $('#mask').fadeTo("slow", 0.8);


        //Colocar el modal en medio de la pantalla
        $(id).css('top', $(window).height() / 2.2 - $(id).height() / 2);
        $(id).css('left', $(window).width() / 2.2 - $(id).width() / 2);

        //Animaciones anidadas
        $("#promociones").hide()
        $(id).fadeIn(2000, function () {
            $("#hotsale").fadeOut(1500, function () {
                $("#promociones").fadeIn(1000)
            })
        });

    };

    //Cerrar modal al hacer click en "Cerrar"
    $('.window .close').click(function (e) {
        //Cancel the link behavior
        e.preventDefault();
        $('#mask, .window').hide();
    });

    //Cerrar modal al hacer click fuera del modal
    $('#mask').click(function () {
        $(this).hide();
        $('.window').hide();
    });

});