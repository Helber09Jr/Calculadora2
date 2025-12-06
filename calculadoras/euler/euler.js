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
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoEuler').innerHTML = '';

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

    if (!expresion) {
      throw new Error('Debe ingresar una expresión para dy/dx');
    }

    if (isNaN(x0)) {
      throw new Error('El valor inicial x€ debe ser un número válido');
    }

    if (isNaN(y0)) {
      throw new Error('El valor inicial y€ debe ser un número válido');
    }

    if (isNaN(h) || h <= 0) {
      throw new Error('El tamaño de paso h debe ser un número positivo');
    }

    if (isNaN(n) || n < 2) {
      throw new Error('Debe calcular al menos 2 puntos');
    }

    // Validar que la función se puede evaluar
    try {
      this.evaluarFuncion(expresion, x0, y0);
    } catch (error) {
      throw error;
    }

    return { expresion, x0, y0, h, n };
  },

  calcular() {
    try {
      const { expresion, x0, y0, h, n } = this.validar();

      const puntos = [];
      let x = x0;
      let y = y0;

      for (let i = 0; i < n; i++) {
        const fx_y = this.evaluarFuncion(expresion, x, y);

        puntos.push({
          i,
          x: parseFloat(x.toFixed(6)),
          y: parseFloat(y.toFixed(6)),
          f_x_y: parseFloat(fx_y.toFixed(6))
        });

        y = y + h * fx_y;
        x = x + h;
      }

      this.estado.resultado = {
        expresion,
        x0, y0, h, n,
        puntos
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Cálculo completado exitosamente: ${n} puntos generados`);

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
        <p class="etiqueta-resultado" style="margin-top: 12px;">Condiciones iniciales:</p>
        <p>x€ = ${this.formatear(r.x0)}, y€ = ${this.formatear(r.y0)}, h = ${this.formatear(r.h)}</p>
      </div>

      <table class="tabla-resultados">
        <thead>
          <tr>
            <th>i</th>
            <th>x<sub>i</sub></th>
            <th>y<sub>i</sub></th>
            <th>f(x<sub>i</sub>, y<sub>i</sub>)</th>
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
        <h4>Paso 1: Fórmula del Método de Euler</h4>
        <p>$$y_{n+1} = y_n + h \\cdot f(x_n, y_n)$$</p>
        <p>donde:</p>
        <p>$$x_{n+1} = x_n + h$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Parámetros Iniciales</h4>
        <p>Ecuación diferencial: $$\\frac{dy}{dx} = ${r.expresion}$$</p>
        <p>Condición inicial: $$x_0 = ${this.formatear(r.x0)}, \\quad y_0 = ${this.formatear(r.y0)}$$</p>
        <p>Tamaño de paso: $$h = ${this.formatear(r.h)}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: Iteraciones del Método</h4>
    `;

    r.puntos.forEach((p, idx) => {
      if (idx < r.puntos.length - 1) {
        const p_siguiente = r.puntos[idx + 1];
        latex += `
          <p style="margin: 12px 0; padding: 8px; background: #f0f9ff; border-left: 3px solid var(--azul-oscuro);">
            <strong>Iteración ${idx}:</strong>
            $$y_{${idx + 1}} = ${this.formatear(p.y)} + ${this.formatear(r.h)} \\times ${this.formatear(p.f_x_y)} = ${this.formatear(p_siguiente.y)}$$
          </p>
        `;
      }
    });

    latex += `
        </div>

        <div class="resultado-final">
          <strong>Resultado Final:</strong>
          <p>Se han calculado ${r.n} puntos de la solución numérica</p>
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
                   `Método de Euler: dy/dx = ${r.expresion}`;

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

    Plotly.newPlot('graficoEuler', [traza], layout, config);
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

    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
