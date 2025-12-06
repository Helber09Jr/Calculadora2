const App = {
  estado: {
    resultado: null
  },

  iniciar() {
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();
  },

  limpiarTodo() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.resultado = null;
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('inputFuncion').value = 'x + y';
      document.getElementById('inputX0').value = '0';
      document.getElementById('inputY0').value = '1';
      document.getElementById('inputH').value = '0.1';
      document.getElementById('inputN').value = '10';
      document.getElementById('inputOrden').value = '3';
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoTaylor').innerHTML = '';

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      alert('Todos los datos han sido limpiados correctamente');
    }
  },

  evaluarFuncion(expresion, x, y) {
    try {
      const func = new Function('x', 'y', `return ${expresion}`);
      return func(x, y);
    } catch (error) {
      throw new Error(`Error en la expresión: ${expresion}. ${error.message}`);
    }
  },

  validar() {
    const expresion = document.getElementById('inputFuncion').value.trim();
    const x0 = parseFloat(document.getElementById('inputX0').value);
    const y0 = parseFloat(document.getElementById('inputY0').value);
    const h = parseFloat(document.getElementById('inputH').value);
    const n = parseInt(document.getElementById('inputN').value);
    const p = parseInt(document.getElementById('inputOrden').value);

    if (!expresion) {
      throw new Error('Debe ingresar una expresión para dy/dx');
    }

    if (isNaN(x0)) {
      throw new Error('El valor inicial x0 debe ser un número válido');
    }

    if (isNaN(y0)) {
      throw new Error('El valor inicial y0 debe ser un número válido');
    }

    if (isNaN(h) || h <= 0) {
      throw new Error('El tamaño de paso h debe ser un número positivo');
    }

    if (isNaN(n) || n < 2) {
      throw new Error('Debe calcular al menos 2 puntos');
    }

    if (isNaN(p) || p < 1 || p > 5) {
      throw new Error('El orden de la serie debe estar entre 1 y 5');
    }

    try {
      this.evaluarFuncion(expresion, x0, y0);
    } catch (error) {
      throw error;
    }

    return { expresion, x0, y0, h, n, p };
  },

  calcularDerivada(expresion, x, y, variables) {
    const delta = 1e-6;

    if (variables === 'x') {
      const f1 = this.evaluarFuncion(expresion, x + delta, y);
      const f2 = this.evaluarFuncion(expresion, x - delta, y);
      return (f1 - f2) / (2 * delta);
    } else if (variables === 'y') {
      const f1 = this.evaluarFuncion(expresion, x, y + delta);
      const f2 = this.evaluarFuncion(expresion, x, y - delta);
      return (f1 - f2) / (2 * delta);
    }
  },

  calcularTermosTaylor(expresion, x, y, h, orden) {
    const terminos = [];

    // Primer término: y'
    const y_prima = this.evaluarFuncion(expresion, x, y);
    terminos.push({ grado: 1, valor: y_prima, coeficiente: h / 1 });

    // Segundo término en adelante: derivadas de orden superior
    if (orden >= 2) {
      const dfx = this.calcularDerivada(expresion, x, y, 'x');
      const dfy = this.calcularDerivada(expresion, x, y, 'y');
      const y_doble_prima = dfx + dfy * y_prima;
      terminos.push({ grado: 2, valor: y_doble_prima, coeficiente: (h * h) / (2 * 1) });
    }

    if (orden >= 3) {
      const dfx = this.calcularDerivada(expresion, x, y, 'x');
      const dfy = this.calcularDerivada(expresion, x, y, 'y');
      const y_prima = this.evaluarFuncion(expresion, x, y);

      const d2fx = this.calcularDerivada(`(${expresion.replace(/x/g, '(x)')})`, x, y, 'x');
      const d2fy_dy = this.calcularDerivada(`(${expresion.replace(/y/g, '(y)')})`, x, y, 'y');
      const d2fx_dy = dfy;

      const y_triple_prima = d2fx + 2 * d2fx_dy * y_prima + d2fy_dy * y_prima * y_prima + dfy * (dfx + dfy * y_prima);
      terminos.push({ grado: 3, valor: y_triple_prima, coeficiente: (h * h * h) / (6 * 1) });
    }

    if (orden >= 4) {
      const h4_fact = (h * h * h * h) / 24;
      terminos.push({ grado: 4, valor: 0, coeficiente: h4_fact });
    }

    if (orden >= 5) {
      const h5_fact = (h * h * h * h * h) / 120;
      terminos.push({ grado: 5, valor: 0, coeficiente: h5_fact });
    }

    return terminos;
  },

  calcular() {
    try {
      const { expresion, x0, y0, h, n, p } = this.validar();

      const puntos = [];
      let x = x0;
      let y = y0;

      for (let i = 0; i < n; i++) {
        const terminos = this.calcularTermosTaylor(expresion, x, y, h, p);
        const fx_y = this.evaluarFuncion(expresion, x, y);

        let delta_y = 0;
        terminos.forEach(t => {
          delta_y += t.coeficiente * t.valor;
        });

        const y_siguiente = y + delta_y;

        puntos.push({
          i,
          x: parseFloat(x.toFixed(6)),
          y: parseFloat(y.toFixed(6)),
          f_x_y: parseFloat(fx_y.toFixed(6)),
          delta_y: parseFloat(delta_y.toFixed(6)),
          terminos: terminos
        });

        y = y_siguiente;
        x = x + h;
      }

      this.estado.resultado = {
        expresion,
        x0, y0, h, n, p,
        puntos
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Cálculo completado exitosamente: ${n} puntos generados usando serie de Taylor orden ${p}`);

    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  formatear(numero) {
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    return parseFloat(numero.toFixed(6)).toString();
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    if (!r) return;

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Ecuación diferencial:</p>
        <p style="font-family: monospace; background: var(--gris-claro); padding: 8px; border-radius: 4px;">dy/dx = ${r.expresion}</p>
        <p class="etiqueta-resultado" style="margin-top: 12px;">Condiciones iniciales y parámetros:</p>
        <p>x€ = ${this.formatear(r.x0)}, y€ = ${this.formatear(r.y0)}, h = ${this.formatear(r.h)}, n = ${r.n}, orden = ${r.p}</p>
      </div>

      <table class="tabla-resultados">
        <thead>
          <tr>
            <th>i</th>
            <th>x<sub>i</sub></th>
            <th>y<sub>i</sub></th>
            <th>f(x<sub>i</sub>, y<sub>i</sub>)</th>
            <th>”y</th>
          </tr>
        </thead>
        <tbody>
    `;

    r.puntos.forEach(p => {
      html += `
        <tr>
          <td>${p.i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${this.formatear(p.f_x_y)}</td>
          <td>${this.formatear(p.delta_y)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Método de Taylor - Fórmula General</h4>
        <p>El método de Taylor aproxima la solución de una ecuación diferencial ordinaria usando una serie de Taylor truncada:</p>
        <p>$$y_{n+1} = y_n + h \\cdot y'_n + \\frac{h^2}{2!} \\cdot y''_n + \\frac{h^3}{3!} \\cdot y'''_n + ... + \\frac{h^p}{p!} \\cdot y^{(p)}_n$$</p>
        <p style="margin-top: 12px; font-size: 0.95em; color: var(--gris-texto);">donde p es el orden de la serie y las derivadas se calculan numéricamente</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Ecuación Diferencial y Condiciones Iniciales</h4>
        <p><strong>Ecuación diferencial:</strong></p>
        <p>$$\\frac{dy}{dx} = ${r.expresion}$$</p>
        <p style="margin-top: 12px;"><strong>Condición inicial:</strong></p>
        <p>$$x_0 = ${this.formatear(r.x0)}, \\quad y_0 = ${this.formatear(r.y0)}$$</p>
        <p style="margin-top: 12px;"><strong>Parámetros:</strong></p>
        <p>$$h = ${this.formatear(r.h)}, \\quad n = ${r.n}, \\quad \\text{orden} = ${r.p}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: Cálculo Iterativo Paso a Paso</h4>
        <p style="margin-bottom: 15px; color: var(--gris-texto);">Se aplica recursivamente la fórmula de Taylor calculando los términos derivados:</p>
    `;

    r.puntos.forEach((p, idx) => {
      if (idx < r.puntos.length - 1) {
        const p_siguiente = r.puntos[idx + 1];
        latex += `
          <p style="margin: 12px 0; padding: 12px; background: #f0f9ff; border-left: 4px solid #1e40af; border-radius: 4px;">
            <strong>Iteración ${idx + 1}:</strong><br>
            $$f(${this.formatear(p.x)}, ${this.formatear(p.y)}) = ${this.formatear(p.f_x_y)}$$<br>
            $$y_{${idx + 1}} = ${this.formatear(p.y)} + ${this.formatear(p.delta_y)} = ${this.formatear(p_siguiente.y)}$$<br>
            $$x_{${idx + 1}} = ${this.formatear(p.x)} + ${this.formatear(r.h)} = ${this.formatear(p_siguiente.x)}$$
          </p>
        `;
      }
    });

    latex += `
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 4: Tabla Resumen de Aproximación</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>n</th>
              <th>x<sub>n</sub></th>
              <th>y<sub>n</sub></th>
              <th>f(x<sub>n</sub>, y<sub>n</sub>)</th>
              <th>”y</th>
            </tr>
          </thead>
          <tbody>
    `;

    r.puntos.forEach(p => {
      latex += `
        <tr>
          <td>${p.i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${this.formatear(p.f_x_y)}</td>
          <td>${this.formatear(p.delta_y)}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>

      <div class="resultado-final">
        <strong>Solución Numérica Aproximada:</strong>
        <p>Se han calculado ${r.n} puntos de la solución aproximada usando el Método de Taylor de orden ${r.p} con h = ${this.formatear(r.h)}</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  graficar() {
    const r = this.estado.resultado;
    if (!r) return;

    const traza = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'lines+markers',
      name: 'Solución aproximada',
      line: { color: '#1e40af', width: 2 },
      marker: { size: 6, color: '#dc2626' }
    };

    const titulo = document.getElementById('tituloExperimento').value ||
                   `Método de Taylor (Orden ${r.p}): dy/dx = ${r.expresion}`;

    const layout = {
      title: {
        text: titulo,
        font: { size: 18, color: '#1e293b', family: 'Inter, system-ui, sans-serif' }
      },
      xaxis: {
        title: { text: 'x', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8'
      },
      yaxis: {
        title: { text: 'y', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8'
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      showlegend: true,
      legend: {
        x: 1, y: 1,
        xanchor: 'right', yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: '#cbd5e1',
        borderwidth: 1
      },
      margin: { l: 70, r: 40, t: 80, b: 60 },
      hovermode: 'closest'
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoTaylor', [traza], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      alert('Primero calcula la solución');
      return;
    }

    const seccion = document.getElementById('seccionDesarrollo');
    const boton = document.getElementById('btnTogglePasos');

    if (seccion.classList.contains('oculto')) {
      seccion.classList.remove('oculto');
      seccion.setAttribute('aria-hidden', 'false');
      boton.textContent = 'Ocultar desarrollo';
    } else {
      seccion.classList.add('oculto');
      seccion.setAttribute('aria-hidden', 'true');
      boton.textContent = 'Abrir desarrollo';
    }
  },

  alternarMenu() {
    const menu = document.getElementById('menuNavegacion');
    menu.classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('tituloExperimento').value = 'Crecimiento Exponencial';
    document.getElementById('inputFuncion').value = 'y';
    document.getElementById('inputX0').value = '0';
    document.getElementById('inputY0').value = '1';
    document.getElementById('inputH').value = '0.1';
    document.getElementById('inputN').value = '10';
    document.getElementById('inputOrden').value = '3';

    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
