/*!
 * Start Bootstrap - Resume v7.0.0 (https://startbootstrap.com/theme/resume)
 * Copyright 2013-2021 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
 */
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

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
              <a class='${item.nombre}' id='restar'><i class="fas fa-minus"></i></a>
              <input type="text" size="2" id='cantidad${item.id}' value='1'></input>
              <a class='${item.nombre}' id='sumar'><i class="fas fa-plus"></i></a>
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
                // agregarCarrito(objetoComprado)
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

});