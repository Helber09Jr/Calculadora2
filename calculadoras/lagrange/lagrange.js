/* --- APLICACION LAGRANGE --- */

const Aplicacion = {

  /* --- ESTADO DE LA APLICACION --- */
  estado: {
    puntos: [],
    xEvaluar: null,
    tituloExperimento: '',
    nombreEjeX: 'x',
    nombreEjeY: 'y',
    formatoDecimales: 2,
    resultadoCalculo: null
  },

  /* --- MODULO DE INTERFAZ --- */
  interfaz: {
    inicializar() {
      this.configurarEventListeners();
      this.actualizarTabla();
      this.actualizarEncabezadosTabla();
    },

    configurarEventListeners() {
      document.getElementById('btnAgregarFila').addEventListener('click', () => {
        this.agregarFila('', '');
      });

      document.getElementById('btnCalcular').addEventListener('click', () => {
        this.ejecutarCalculo();
      });

      document.getElementById('btnEjemplo1').addEventListener('click', () => {
        Aplicacion.ejemplos.cargarEjemplo1();
      });

      document.getElementById('btnEjemplo2').addEventListener('click', () => {
        Aplicacion.ejemplos.cargarEjemplo2();
      });

      document.getElementById('nombreEjeX').addEventListener('input', () => {
        Aplicacion.estado.nombreEjeX = document.getElementById('nombreEjeX').value || 'x';
        this.actualizarEncabezadosTabla();
        Aplicacion.almacenamiento.guardar();
      });

      document.getElementById('nombreEjeY').addEventListener('input', () => {
        Aplicacion.estado.nombreEjeY = document.getElementById('nombreEjeY').value || 'y';
        this.actualizarEncabezadosTabla();
        Aplicacion.almacenamiento.guardar();
      });

      document.getElementById('tituloExperimento').addEventListener('input', () => {
        Aplicacion.estado.tituloExperimento = document.getElementById('tituloExperimento').value;
        Aplicacion.almacenamiento.guardar();
      });

      document.getElementById('inputXEvaluar').addEventListener('input', () => {
        Aplicacion.almacenamiento.guardar();
      });

      document.getElementById('selectFormato').addEventListener('change', (e) => {
        Aplicacion.estado.formatoDecimales = e.target.value;
        Aplicacion.almacenamiento.guardar();
      });

      document.getElementById('btnTogglePasos').addEventListener('click', () => {
        const seccion = document.getElementById('seccionDesarrollo');
        const boton = document.getElementById('btnTogglePasos');
        seccion.classList.toggle('oculto');
        boton.textContent = seccion.classList.contains('oculto') ? 'Ver Desarrollo' : 'Ocultar Desarrollo';
      });

      document.getElementById('btnPegar').addEventListener('click', () => {
        Aplicacion.importacion.desdePortapapeles();
      });

      document.getElementById('inputImportar').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          Aplicacion.importacion.desdeArchivo(e.target.files[0]);
        }
      });

      document.getElementById('btnExportarPNG').addEventListener('click', () => {
        Aplicacion.exportacion.exportarPNG();
      });

      document.getElementById('btnExportarCSV').addEventListener('click', () => {
        Aplicacion.exportacion.exportarCSV();
      });

      document.getElementById('btnExportarPDF').addEventListener('click', () => {
        Aplicacion.exportacion.exportarPDF();
      });

      document.getElementById('botonMenu').addEventListener('click', () => {
        const menu = document.getElementById('menuNavegacion');
        menu.classList.toggle('menu-activo');
      });
    },

    agregarFila(x = '', y = '') {
      const tbody = document.getElementById('cuerpoTablaPuntos');
      const fila = document.createElement('tr');
      const indice = tbody.children.length;

      fila.innerHTML = \`
        <td>\${indice}</td>
        <td><input type="number" step="any" class="input-tabla" data-tipo="x" data-indice="\${indice}" value="\${x}"></td>
        <td><input type="number" step="any" class="input-tabla" data-tipo="y" data-indice="\${indice}" value="\${y}"></td>
        <td><button class="boton-eliminar" data-indice="\${indice}">X</button></td>
      \`;

      tbody.appendChild(fila);

      fila.querySelector('.boton-eliminar').addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.indice);
        this.eliminarFila(idx);
      });

      fila.querySelectorAll('.input-tabla').forEach(input => {
        input.addEventListener('input', () => {
          this.leerPuntosDesdeTabla();
          Aplicacion.almacenamiento.guardar();
        });
      });

      this.leerPuntosDesdeTabla();
    },

    eliminarFila(indice) {
      this.leerPuntosDesdeTabla();
      Aplicacion.estado.puntos.splice(indice, 1);
      this.actualizarTabla();
      Aplicacion.almacenamiento.guardar();
    },

    actualizarTabla() {
      const tbody = document.getElementById('cuerpoTablaPuntos');
      tbody.innerHTML = '';

      if (Aplicacion.estado.puntos.length === 0) {
        this.agregarFila('', '');
        this.agregarFila('', '');
      } else {
        Aplicacion.estado.puntos.forEach((punto, idx) => {
          this.agregarFila(punto.x !== null && punto.x !== undefined ? punto.x : '',
                          punto.y !== null && punto.y !== undefined ? punto.y : '');
        });
      }
    },

    leerPuntosDesdeTabla() {
      const inputs = document.querySelectorAll('.input-tabla');
      const puntos = [];
      const puntosTemp = {};

      inputs.forEach(input => {
        const indice = parseInt(input.dataset.indice);
        const tipo = input.dataset.tipo;
        const valor = input.value.trim();

        if (!puntosTemp[indice]) {
          puntosTemp[indice] = {};
        }

        puntosTemp[indice][tipo] = valor;
      });

      Object.keys(puntosTemp).forEach(indice => {
        const punto = puntosTemp[indice];
        if (punto.x !== '' || punto.y !== '') {
          puntos.push({
            x: punto.x !== '' ? parseFloat(punto.x.replace(',', '.')) : null,
            y: punto.y !== '' ? parseFloat(punto.y.replace(',', '.')) : null
          });
        }
      });

      Aplicacion.estado.puntos = puntos;
    },

    actualizarEncabezadosTabla() {
      const nombreX = document.getElementById('nombreEjeX').value || 'x';
      const nombreY = document.getElementById('nombreEjeY').value || 'y';

      document.getElementById('encabezadoX').textContent = nombreX;
      document.getElementById('encabezadoY').textContent = nombreY;
    },

    ejecutarCalculo() {
      this.limpiarErrores();
      this.leerPuntosDesdeTabla();

      const xEvaluar = parseFloat(document.getElementById('inputXEvaluar').value.replace(',', '.'));

      const validacion = Aplicacion.validacion.validarPuntos(Aplicacion.estado.puntos);
      if (!validacion.valido) {
        validacion.errores.forEach(error => {
          this.mostrarNotificacion(error, 'error');
        });
        return;
      }

      if (!Aplicacion.validacion.validarXEvaluar(xEvaluar)) {
        this.mostrarNotificacion('El valor de x a evaluar debe ser un número válido', 'error');
        document.getElementById('inputXEvaluar').classList.add('campo-invalido');
        return;
      }

      Aplicacion.estado.xEvaluar = xEvaluar;

      try {
        const resultado = Aplicacion.matematicas.calcularLagrange(Aplicacion.estado.puntos, xEvaluar);
        Aplicacion.estado.resultadoCalculo = resultado;

        Aplicacion.resultados.mostrarTablaResultados(resultado);
        Aplicacion.resultados.mostrarDesarrolloPasoAPaso(resultado);
        Aplicacion.graficos.dibujarPolinomio(Aplicacion.estado.puntos, xEvaluar, resultado);

        this.mostrarNotificacion('Interpolación calculada correctamente', 'exito');
        Aplicacion.almacenamiento.guardar();

      } catch (error) {
        this.mostrarNotificacion('Error en el cálculo: ' + error.message, 'error');
        console.error(error);
      }
    },

    mostrarNotificacion(mensaje, tipo) {
      const contenedor = document.getElementById('contenedorNotificaciones');
      const notificacion = document.createElement('div');
      notificacion.className = \`notificacion notificacion-\${tipo}\`;

      const iconos = {
        exito: '✓',
        error: '✗',
        advertencia: '!',
        info: 'i'
      };

      notificacion.innerHTML = \`
        <span class="icono">\${iconos[tipo] || 'i'}</span>
        <span class="mensaje">\${mensaje}</span>
      \`;

      contenedor.appendChild(notificacion);

      setTimeout(() => {
        notificacion.classList.add('notificacion-salida');
        setTimeout(() => {
          notificacion.remove();
        }, 300);
      }, 4000);
    },

    limpiarErrores() {
      document.querySelectorAll('.campo-invalido').forEach(el => {
        el.classList.remove('campo-invalido');
      });
    }
  },

  /* --- MODULO DE MATEMATICAS --- */
  matematicas: {
    calcularLagrange(puntos, xEval) {
      const n = puntos.length;
      const polinomiosBase = [];
      const contribuciones = [];
      let resultado = 0;
      let acumulado = 0;

      for (let i = 0; i < n; i++) {
        const Li = this.calcularPolinomioBase(i, puntos, xEval);
        polinomiosBase.push(Li);

        const contribucion = puntos[i].y * Li.valor;
        acumulado += contribucion;

        contribuciones.push({
          indice: i,
          xi: puntos[i].x,
          yi: puntos[i].y,
          Li: Li.valor,
          contribucion: contribucion,
          acumulado: acumulado
        });

        resultado += contribucion;
      }

      return {
        polinomiosBase,
        contribuciones,
        resultado,
        xEval,
        puntos
      };
    },

    calcularPolinomioBase(i, puntos, xEval) {
      const n = puntos.length;
      let numerador = 1;
      let denominador = 1;
      const factoresNumerador = [];
      const factoresDenominador = [];

      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const factorNum = xEval - puntos[j].x;
          const factorDen = puntos[i].x - puntos[j].x;

          numerador *= factorNum;
          denominador *= factorDen;

          factoresNumerador.push({
            xj: puntos[j].x,
            valor: factorNum
          });

          factoresDenominador.push({
            xj: puntos[j].x,
            valor: factorDen
          });
        }
      }

      const valor = numerador / denominador;

      return {
        numerador,
        denominador,
        valor,
        factoresNumerador,
        factoresDenominador
      };
    },

    formatearNumero(numero, decimales) {
      if (decimales === 'auto') {
        if (Number.isInteger(numero)) {
          return numero.toString();
        }
        const redondeado = Math.round(numero * 1000000) / 1000000;
        return redondeado.toString();
      }

      const dec = parseInt(decimales);
      return numero.toFixed(dec);
    },

    generarPuntosPolinomio(puntos, resultado) {
      const xs = puntos.map(p => p.x);
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const rango = xMax - xMin;
      const inicio = xMin - rango * 0.1;
      const fin = xMax + rango * 0.1;

      const puntosPolinomio = [];
      const numPuntos = 200;
      const paso = (fin - inicio) / numPuntos;

      for (let i = 0; i <= numPuntos; i++) {
        const x = inicio + i * paso;
        const y = this.evaluarPolinomio(x, puntos);
        puntosPolinomio.push({ x, y });
      }

      return puntosPolinomio;
    },

    evaluarPolinomio(x, puntos) {
      let y = 0;
      const n = puntos.length;

      for (let i = 0; i < n; i++) {
        let Li = 1;
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            Li *= (x - puntos[j].x) / (puntos[i].x - puntos[j].x);
          }
        }
        y += puntos[i].y * Li;
      }

      return y;
    }
  },

  /* --- MODULO DE VALIDACION --- */
  validacion: {
    validarPuntos(puntos) {
      const errores = [];

      const puntosValidos = puntos.filter(p =>
        p.x !== null && !isNaN(p.x) && p.y !== null && !isNaN(p.y)
      );

      if (puntosValidos.length < 2) {
        errores.push('Se necesitan al menos 2 puntos válidos');
      }

      puntos.forEach((punto, idx) => {
        if (punto.x === null || isNaN(punto.x)) {
          errores.push(\`El valor x del punto \${idx} no es válido\`);
          const input = document.querySelector(\`[data-tipo="x"][data-indice="\${idx}"]\`);
          if (input) input.classList.add('campo-invalido');
        }
        if (punto.y === null || isNaN(punto.y)) {
          errores.push(\`El valor y del punto \${idx} no es válido\`);
          const input = document.querySelector(\`[data-tipo="y"][data-indice="\${idx}"]\`);
          if (input) input.classList.add('campo-invalido');
        }
      });

      const duplicados = this.verificarXDuplicados(puntosValidos);
      if (duplicados.length > 0) {
        errores.push(\`Valores X duplicados: \${duplicados.join(', ')}\`);
      }

      return {
        valido: errores.length === 0,
        errores
      };
    },

    validarXEvaluar(x) {
      return !isNaN(x) && x !== null && x !== undefined;
    },

    verificarXDuplicados(puntos) {
      const valoresX = puntos.map(p => p.x);
      const duplicados = [];

      valoresX.forEach((x, i) => {
        if (valoresX.indexOf(x) !== i && duplicados.indexOf(x) === -1) {
          duplicados.push(x);
        }
      });

      return duplicados;
    }
  },

  /* --- MODULO DE ALMACENAMIENTO --- */
  almacenamiento: {
    guardar() {
      const estadoGuardar = {
        puntos: Aplicacion.estado.puntos,
        xEvaluar: document.getElementById('inputXEvaluar').value,
        tituloExperimento: document.getElementById('tituloExperimento').value,
        nombreEjeX: document.getElementById('nombreEjeX').value,
        nombreEjeY: document.getElementById('nombreEjeY').value,
        formatoDecimales: Aplicacion.estado.formatoDecimales
      };

      localStorage.setItem('lagrange_estado', JSON.stringify(estadoGuardar));
    },

    cargar() {
      const datos = localStorage.getItem('lagrange_estado');
      if (datos) {
        try {
          const estado = JSON.parse(datos);

          Aplicacion.estado.puntos = estado.puntos || [];
          Aplicacion.estado.tituloExperimento = estado.tituloExperimento || '';
          Aplicacion.estado.nombreEjeX = estado.nombreEjeX || 'x';
          Aplicacion.estado.nombreEjeY = estado.nombreEjeY || 'y';
          Aplicacion.estado.formatoDecimales = estado.formatoDecimales || 2;

          document.getElementById('tituloExperimento').value = estado.tituloExperimento || '';
          document.getElementById('nombreEjeX').value = estado.nombreEjeX || 'x';
          document.getElementById('nombreEjeY').value = estado.nombreEjeY || 'y';
          document.getElementById('inputXEvaluar').value = estado.xEvaluar || '3';
          document.getElementById('selectFormato').value = estado.formatoDecimales || '2';

        } catch (error) {
          console.error('Error al cargar estado:', error);
        }
      }
    }
  },

  /* --- MODULO DE GRAFICOS --- */
  graficos: {
    dibujarPolinomio(puntos, xEval, resultado) {
      const puntosPolinomio = Aplicacion.matematicas.generarPuntosPolinomio(puntos, resultado);

      const traza1 = {
        x: puntosPolinomio.map(p => p.x),
        y: puntosPolinomio.map(p => p.y),
        mode: 'lines',
        name: 'P(x) Lagrange',
        line: {
          color: '#0b4a6f',
          width: 2
        }
      };

      const traza2 = {
        x: puntos.map(p => p.x),
        y: puntos.map(p => p.y),
        mode: 'markers',
        name: 'Puntos dados',
        marker: {
          color: '#ef4444',
          size: 10,
          symbol: 'circle'
        }
      };

      const traza3 = {
        x: [xEval],
        y: [resultado.resultado],
        mode: 'markers',
        name: \`P(\${xEval})\`,
        marker: {
          color: '#10b981',
          size: 12,
          symbol: 'diamond'
        }
      };

      const layout = {
        title: Aplicacion.estado.tituloExperimento || 'Interpolación de Lagrange',
        xaxis: {
          title: Aplicacion.estado.nombreEjeX,
          gridcolor: '#e5e7eb'
        },
        yaxis: {
          title: Aplicacion.estado.nombreEjeY,
          gridcolor: '#e5e7eb'
        },
        plot_bgcolor: '#f8fafc',
        paper_bgcolor: 'white',
        showlegend: true,
        legend: {
          x: 0,
          y: 1
        },
        margin: {
          l: 60,
          r: 40,
          t: 60,
          b: 60
        }
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
      };

      Plotly.newPlot('graficoLagrange', [traza1, traza2, traza3], layout, config);
    }
  },

  /* --- MODULO DE RESULTADOS --- */
  resultados: {
    mostrarTablaResultados(resultado) {
      const contenedor = document.getElementById('contenedorResultado');
      const formato = Aplicacion.estado.formatoDecimales;

      let html = \`
        <div class="resultado-principal">
          <p class="etiqueta-resultado">Valor interpolado:</p>
          <p class="valor-resultado">P(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)}) = \${Aplicacion.matematicas.formatearNumero(resultado.resultado, formato)}</p>
        </div>
        <table class="tabla-resultados">
          <thead>
            <tr>
              <th>i</th>
              <th>\${Aplicacion.estado.nombreEjeX}</th>
              <th>\${Aplicacion.estado.nombreEjeY}</th>
              <th>L<sub>i</sub>(x)</th>
              <th>y<sub>i</sub> · L<sub>i</sub>(x)</th>
              <th>Acumulado</th>
            </tr>
          </thead>
          <tbody>
      \`;

      resultado.contribuciones.forEach(contrib => {
        html += \`
          <tr>
            <td>\${contrib.indice}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(contrib.xi, formato)}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(contrib.yi, formato)}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(contrib.Li, formato)}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(contrib.contribucion, formato)}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(contrib.acumulado, formato)}</td>
          </tr>
        \`;
      });

      html += \`
          </tbody>
        </table>
      \`;

      contenedor.innerHTML = html;
    },

    mostrarDesarrolloPasoAPaso(resultado) {
      const contenedor = document.getElementById('contenedorDesarrollo');
      const formato = Aplicacion.estado.formatoDecimales;
      const nombreX = Aplicacion.estado.nombreEjeX;
      const nombreY = Aplicacion.estado.nombreEjeY;

      let latex = \`
        <div class="paso-desarrollo">
          <h4>Paso 1: Fórmula General de Lagrange</h4>
          <p>$$P(x) = \\\\sum_{i=0}^{n} \${nombreY}_i \\\\cdot L_i(x)$$</p>
          <p>Donde:</p>
          <p>$$L_i(x) = \\\\prod_{\\\\substack{j=0\\\\\\\\j \\\\neq i}}^{n} \\\\frac{x - \${nombreX}_j}{\${nombreX}_i - \${nombreX}_j}$$</p>
        </div>

        <div class="paso-desarrollo">
          <h4>Paso 2: Puntos Dados</h4>
          <table class="tabla-desarrollo">
            <thead>
              <tr>
                <th>i</th>
                <th>\${nombreX}<sub>i</sub></th>
                <th>\${nombreY}<sub>i</sub></th>
              </tr>
            </thead>
            <tbody>
      \`;

      resultado.puntos.forEach((punto, i) => {
        latex += \`
          <tr>
            <td>\${i}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(punto.x, formato)}</td>
            <td>\${Aplicacion.matematicas.formatearNumero(punto.y, formato)}</td>
          </tr>
        \`;
      });

      latex += \`
            </tbody>
          </table>
        </div>

        <div class="paso-desarrollo">
          <h4>Paso 3: Cálculo de cada L<sub>i</sub>(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)})</h4>
      \`;

      resultado.polinomiosBase.forEach((Li, i) => {
        latex += \`
          <div class="calculo-li">
            <p><strong>L<sub>\${i}</sub>(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)}):</strong></p>
            <p class="latex-formula">$$L_\${i}(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)}) = \`;

        latex += '\\\\frac{';
        Li.factoresNumerador.forEach((factor, idx) => {
          if (idx > 0) latex += ' \\\\cdot ';
          latex += \`(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)} - \${Aplicacion.matematicas.formatearNumero(factor.xj, formato)})\`;
        });
        latex += '}{';
        Li.factoresDenominador.forEach((factor, idx) => {
          if (idx > 0) latex += ' \\\\cdot ';
          latex += \`(\${Aplicacion.matematicas.formatearNumero(resultado.puntos[i].x, formato)} - \${Aplicacion.matematicas.formatearNumero(factor.xj, formato)})\`;
        });
        latex += '}$$</p>';

        latex += \`<p class="latex-formula">$$= \\\\frac{\${Aplicacion.matematicas.formatearNumero(Li.numerador, formato)}}{\${Aplicacion.matematicas.formatearNumero(Li.denominador, formato)}} = \${Aplicacion.matematicas.formatearNumero(Li.valor, formato)}$$</p>\`;
        latex += \`</div>\`;
      });

      latex += \`</div>\`;

      latex += \`
        <div class="paso-desarrollo">
          <h4>Paso 4: Suma de Contribuciones</h4>
          <p>$$P(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)}) = \`;

      resultado.contribuciones.forEach((contrib, i) => {
        if (i > 0) latex += ' + ';
        latex += \`\${Aplicacion.matematicas.formatearNumero(contrib.yi, formato)} \\\\cdot \${Aplicacion.matematicas.formatearNumero(contrib.Li, formato)}\`;
      });

      latex += '$$</p>';

      latex += \`<p>$$= \`;
      resultado.contribuciones.forEach((contrib, i) => {
        if (i > 0) latex += ' + ';
        latex += Aplicacion.matematicas.formatearNumero(contrib.contribucion, formato);
      });
      latex += '$$</p>';

      latex += \`<p class="resultado-final">$$P(\${Aplicacion.matematicas.formatearNumero(resultado.xEval, formato)}) = \${Aplicacion.matematicas.formatearNumero(resultado.resultado, formato)}$$</p>\`;
      latex += \`</div>\`;

      contenedor.innerHTML = latex;
      this.renderizarLatex();
    },

    renderizarLatex() {
      if (window.MathJax) {
        MathJax.typesetPromise().catch((err) => console.error('Error renderizando LaTeX:', err));
      }
    }
  },

  /* --- MODULO DE IMPORTACION --- */
  importacion: {
    async desdePortapapeles() {
      try {
        const texto = await navigator.clipboard.readText();
        const puntos = this.parsearTexto(texto);

        if (puntos.length === 0) {
          Aplicacion.interfaz.mostrarNotificacion('No se encontraron datos válidos en el portapapeles', 'advertencia');
          return;
        }

        Aplicacion.estado.puntos = puntos;
        Aplicacion.interfaz.actualizarTabla();
        Aplicacion.almacenamiento.guardar();
        Aplicacion.interfaz.mostrarNotificacion(\`\${puntos.length} puntos importados correctamente\`, 'exito');

      } catch (error) {
        Aplicacion.interfaz.mostrarNotificacion('Error al leer del portapapeles: ' + error.message, 'error');
      }
    },

    desdeArchivo(archivo) {
      const extension = archivo.name.split('.').pop().toLowerCase();

      if (extension === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const texto = e.target.result;
          const puntos = this.parsearCSV(texto);
          this.procesarPuntosImportados(puntos, archivo.name);
        };
        reader.readAsText(archivo);

      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const datos = new Uint8Array(e.target.result);
          this.parsearExcel(datos, archivo.name);
        };
        reader.readAsArrayBuffer(archivo);

      } else {
        Aplicacion.interfaz.mostrarNotificacion('Formato de archivo no soportado', 'error');
      }
    },

    parsearTexto(texto) {
      const lineas = texto.trim().split('\\n');
      const puntos = [];

      lineas.forEach(linea => {
        const valores = linea.trim().split(/[\\s,;\\t]+/);
        if (valores.length >= 2) {
          const x = parseFloat(valores[0].replace(',', '.'));
          const y = parseFloat(valores[1].replace(',', '.'));

          if (!isNaN(x) && !isNaN(y)) {
            puntos.push({ x, y });
          }
        }
      });

      return puntos;
    },

    parsearCSV(texto) {
      const lineas = texto.trim().split('\\n');
      const puntos = [];
      let inicioLinea = 0;

      if (lineas.length > 0) {
        const primeraLinea = lineas[0].toLowerCase();
        if (primeraLinea.includes('x') || primeraLinea.includes('y') || primeraLinea.includes('i')) {
          inicioLinea = 1;
        }
      }

      for (let i = inicioLinea; i < lineas.length; i++) {
        const valores = lineas[i].trim().split(/[,;\\t]+/);

        let x, y;
        if (valores.length >= 3) {
          x = parseFloat(valores[1].replace(',', '.'));
          y = parseFloat(valores[2].replace(',', '.'));
        } else if (valores.length >= 2) {
          x = parseFloat(valores[0].replace(',', '.'));
          y = parseFloat(valores[1].replace(',', '.'));
        }

        if (!isNaN(x) && !isNaN(y)) {
          puntos.push({ x, y });
        }
      }

      return puntos;
    },

    parsearExcel(datos, nombreArchivo) {
      try {
        const workbook = XLSX.read(datos, { type: 'array' });
        const primeraHoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(primeraHoja, { header: 1 });

        const puntos = [];
        let inicioFila = 0;

        if (json.length > 0) {
          const primeraFila = json[0];
          if (primeraFila.some(val => typeof val === 'string')) {
            inicioFila = 1;
          }
        }

        for (let i = inicioFila; i < json.length; i++) {
          const fila = json[i];
          let x, y;

          if (fila.length >= 3) {
            x = parseFloat(fila[1]);
            y = parseFloat(fila[2]);
          } else if (fila.length >= 2) {
            x = parseFloat(fila[0]);
            y = parseFloat(fila[1]);
          }

          if (!isNaN(x) && !isNaN(y)) {
            puntos.push({ x, y });
          }
        }

        this.procesarPuntosImportados(puntos, nombreArchivo);

      } catch (error) {
        Aplicacion.interfaz.mostrarNotificacion('Error al leer archivo Excel: ' + error.message, 'error');
      }
    },

    procesarPuntosImportados(puntos, nombreArchivo) {
      if (puntos.length === 0) {
        Aplicacion.interfaz.mostrarNotificacion('No se encontraron datos válidos en el archivo', 'advertencia');
        return;
      }

      Aplicacion.estado.puntos = puntos;
      Aplicacion.interfaz.actualizarTabla();
      Aplicacion.almacenamiento.guardar();
      Aplicacion.interfaz.mostrarNotificacion(\`\${puntos.length} puntos importados desde \${nombreArchivo}\`, 'exito');
    }
  },

  /* --- MODULO DE EXPORTACION --- */
  exportacion: {
    exportarPNG() {
      const grafico = document.getElementById('graficoLagrange');

      if (!grafico || !Aplicacion.estado.resultadoCalculo) {
        Aplicacion.interfaz.mostrarNotificacion('Primero debe calcular la interpolación', 'advertencia');
        return;
      }

      Plotly.downloadImage('graficoLagrange', {
        format: 'png',
        width: 1200,
        height: 800,
        filename: 'lagrange_grafico'
      });

      Aplicacion.interfaz.mostrarNotificacion('Gráfico exportado como PNG', 'exito');
    },

    exportarCSV() {
      if (Aplicacion.estado.puntos.length === 0) {
        Aplicacion.interfaz.mostrarNotificacion('No hay datos para exportar', 'advertencia');
        return;
      }

      const nombreX = Aplicacion.estado.nombreEjeX;
      const nombreY = Aplicacion.estado.nombreEjeY;
      let csv = \`i,\${nombreX},\${nombreY}\\n\`;

      Aplicacion.estado.puntos.forEach((punto, i) => {
        csv += \`\${i},\${punto.x},\${punto.y}\\n\`;
      });

      if (Aplicacion.estado.resultadoCalculo) {
        csv += \`\\nResultado\\n\`;
        csv += \`x_evaluado,\${Aplicacion.estado.xEvaluar}\\n\`;
        csv += \`P(x),\${Aplicacion.estado.resultadoCalculo.resultado}\\n\`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lagrange_datos.csv';
      link.click();

      Aplicacion.interfaz.mostrarNotificacion('Datos exportados como CSV', 'exito');
    },

    exportarPDF() {
      if (!Aplicacion.estado.resultadoCalculo) {
        Aplicacion.interfaz.mostrarNotificacion('Primero debe calcular la interpolación', 'advertencia');
        return;
      }

      const elemento = document.createElement('div');
      elemento.style.padding = '20px';
      elemento.style.backgroundColor = 'white';

      const titulo = Aplicacion.estado.tituloExperimento || 'Interpolación de Lagrange';
      const fecha = new Date().toLocaleDateString('es-PE');

      elemento.innerHTML = \`
        <h1 style="text-align: center; color: #0b4a6f;">\${titulo}</h1>
        <p style="text-align: center; color: #64748b;">Fecha: \${fecha}</p>
        <hr>
      \`;

      const graficoClone = document.getElementById('graficoLagrange').cloneNode(true);
      elemento.appendChild(graficoClone);

      const resultadoClone = document.getElementById('contenedorResultado').cloneNode(true);
      elemento.appendChild(resultadoClone);

      const desarrolloClone = document.getElementById('contenedorDesarrollo').cloneNode(true);
      elemento.appendChild(desarrolloClone);

      const opciones = {
        margin: 10,
        filename: 'lagrange_reporte.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opciones).from(elemento).save().then(() => {
        Aplicacion.interfaz.mostrarNotificacion('Reporte exportado como PDF', 'exito');
      });
    }
  },

  /* --- MODULO DE EJEMPLOS --- */
  ejemplos: {
    cargarEjemplo1() {
      Aplicacion.estado.tituloExperimento = 'Ejemplo: Interpolación básica';
      Aplicacion.estado.nombreEjeX = 'x';
      Aplicacion.estado.nombreEjeY = 'y';
      Aplicacion.estado.puntos = [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 4, y: 1 }
      ];
      Aplicacion.estado.xEvaluar = 3;

      document.getElementById('tituloExperimento').value = Aplicacion.estado.tituloExperimento;
      document.getElementById('nombreEjeX').value = Aplicacion.estado.nombreEjeX;
      document.getElementById('nombreEjeY').value = Aplicacion.estado.nombreEjeY;
      document.getElementById('inputXEvaluar').value = Aplicacion.estado.xEvaluar;

      Aplicacion.interfaz.actualizarTabla();
      Aplicacion.interfaz.actualizarEncabezadosTabla();
      Aplicacion.almacenamiento.guardar();
      Aplicacion.interfaz.mostrarNotificacion('Ejemplo básico cargado', 'info');
    },

    cargarEjemplo2() {
      Aplicacion.estado.tituloExperimento = 'Ejemplo: Enfriamiento de un líquido';
      Aplicacion.estado.nombreEjeX = 'Tiempo (min)';
      Aplicacion.estado.nombreEjeY = 'Temperatura (°C)';
      Aplicacion.estado.puntos = [
        { x: 0, y: 90 },
        { x: 5, y: 70 },
        { x: 10, y: 55 }
      ];
      Aplicacion.estado.xEvaluar = 7;

      document.getElementById('tituloExperimento').value = Aplicacion.estado.tituloExperimento;
      document.getElementById('nombreEjeX').value = Aplicacion.estado.nombreEjeX;
      document.getElementById('nombreEjeY').value = Aplicacion.estado.nombreEjeY;
      document.getElementById('inputXEvaluar').value = Aplicacion.estado.xEvaluar;

      Aplicacion.interfaz.actualizarTabla();
      Aplicacion.interfaz.actualizarEncabezadosTabla();
      Aplicacion.almacenamiento.guardar();
      Aplicacion.interfaz.mostrarNotificacion('Ejemplo contextual cargado', 'info');
    }
  }
};

/* --- INICIALIZACION --- */
document.addEventListener('DOMContentLoaded', () => {
  Aplicacion.almacenamiento.cargar();
  Aplicacion.interfaz.inicializar();
});
