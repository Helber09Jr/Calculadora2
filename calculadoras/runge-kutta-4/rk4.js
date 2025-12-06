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
    if (confirm('øEst·s seguro de limpiar todos los datos?')) {
      this.estado.resultado = null;
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('inputFuncion').value = 'x + y';
      document.getElementById('inputX0').value = '0';
      document.getElementById('inputY0').value = '1';
      document.getElementById('inputH').value = '0.1';
      document.getElementById('inputN').value = '10';
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoRK4').innerHTML = '';

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
      throw new Error(`Error en la expresiÛn: ${expresion}. ${error.message}`);
    }
  },

  validar() {
    const expresion = document.getElementById('inputFuncion').value.trim();
    const x0 = parseFloat(document.getElementById('inputX0').value);
    const y0 = parseFloat(document.getElementById('inputY0').value);
    const h = parseFloat(document.getElementById('inputH').value);
    const n = parseInt(document.getElementById('inputN').value);

    if (!expresion) {
      throw new Error('Debe ingresar una expresiÛn para dy/dx');
    }

    if (isNaN(x0)) {
      throw new Error('El valor inicial x0 debe ser un n˙mero v·lido');
    }

    if (isNaN(y0)) {
      throw new Error('El valor inicial y0 debe ser un n˙mero v·lido');
    }

    if (isNaN(h) || h <= 0) {
      throw new Error('El tamaÒo de paso h debe ser un n˙mero positivo');
    }

    if (isNaN(n) || n < 2) {
      throw new Error('Debe calcular al menos 2 puntos');
    }

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
        // C·lculo de k1
        const k1 = this.evaluarFuncion(expresion, x, y);

        // C·lculo de k2
        const k2 = this.evaluarFuncion(expresion, x + h / 2, y + (h / 2) * k1);

        // C·lculo de k3
        const k3 = this.evaluarFuncion(expresion, x + h / 2, y + (h / 2) * k2);

        // C·lculo de k4
        const k4 = this.evaluarFuncion(expresion, x + h, y + h * k3);

        // C·lculo del incremento
        const deltaY = (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);

        puntos.push({
          i,
          x: parseFloat(x.toFixed(6)),
          y: parseFloat(y.toFixed(6)),
          k1: parseFloat(k1.toFixed(6)),
          k2: parseFloat(k2.toFixed(6)),
          k3: parseFloat(k3.toFixed(6)),
          k4: parseFloat(k4.toFixed(6)),
          deltaY: parseFloat(deltaY.toFixed(6))
        });

        // ActualizaciÛn de valores
        y = y + deltaY;
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

      alert(`C·lculo completado exitosamente: ${n} puntos generados mediante Runge-Kutta orden 4`);

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
        <p class="etiqueta-resultado">EcuaciÛn diferencial:</p>
        <p style="font-family: monospace; background: var(--gris-claro); padding: 8px; border-radius: 4px;">dy/dx = ${r.expresion}</p>
        <p class="etiqueta-resultado" style="margin-top: 12px;">Condiciones iniciales y par·metros:</p>
        <p>xÄ = ${this.formatear(r.x0)}, yÄ = ${this.formatear(r.y0)}, h = ${this.formatear(r.h)}, n = ${r.n}</p>
      </div>

      <table class="tabla-resultados">
        <thead>
          <tr>
            <th>i</th>
            <th>x<sub>i</sub></th>
            <th>y<sub>i</sub></th>
            <th>k<sub>1</sub></th>
            <th>k<sub>2</sub></th>
            <th>k<sub>3</sub></th>
            <th>k<sub>4</sub></th>
            <th>îy</th>
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
          <td>${this.formatear(p.k1)}</td>
          <td>${this.formatear(p.k2)}</td>
          <td>${this.formatear(p.k3)}</td>
          <td>${this.formatear(p.k4)}</td>
          <td>${this.formatear(p.deltaY)}</td>
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
        <h4>Paso 1: MÈtodo Runge-Kutta Orden 4 - FÛrmula General</h4>
        <p>El mÈtodo de Runge-Kutta orden 4 es uno de los mÈtodos numÈricos m·s utilizados para resolver ecuaciones diferenciales ordinarias debido a su excelente balance entre precisiÛn y eficiencia. Utiliza cuatro evaluaciones de la funciÛn por paso:</p>
        <p>$$k_1 = f(x_n, y_n)$$</p>
        <p>$$k_2 = f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} k_1)$$</p>
        <p>$$k_3 = f(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} k_2)$$</p>
        <p>$$k_4 = f(x_n + h, y_n + h \\cdot k_3)$$</p>
        <p>$$y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$</p>
        <p>$$x_{n+1} = x_n + h$$</p>
        <p style="margin-top: 12px; font-size: 0.95em; color: var(--gris-texto);">Esta fÛrmula utiliza ponderaciones que hacen hincapiÈ en los valores intermedios (kÇ y kÉ) con el doble de peso que en los extremos</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: EcuaciÛn Diferencial y Condiciones Iniciales</h4>
        <p><strong>EcuaciÛn diferencial:</strong></p>
        <p>$$\\frac{dy}{dx} = ${r.expresion}$$</p>
        <p style="margin-top: 12px;"><strong>CondiciÛn inicial:</strong></p>
        <p>$$x_0 = ${this.formatear(r.x0)}, \\quad y_0 = ${this.formatear(r.y0)}$$</p>
        <p style="margin-top: 12px;"><strong>TamaÒo de paso:</strong></p>
        <p>$$h = ${this.formatear(r.h)}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: C·lculo Iterativo Paso a Paso</h4>
        <p style="margin-bottom: 15px; color: var(--gris-texto);">Se aplica la fÛrmula de Runge-Kutta orden 4 calculando kÅ, kÇ, kÉ y kÑ en cada iteraciÛn:</p>
    `;

    r.puntos.forEach((p, idx) => {
      if (idx < r.puntos.length - 1) {
        const p_siguiente = r.puntos[idx + 1];
        latex += `
          <p style="margin: 12px 0; padding: 12px; background: #f0f9ff; border-left: 4px solid #1e40af; border-radius: 4px;">
            <strong>IteraciÛn ${idx + 1}:</strong><br>
            $$k_1 = f(${this.formatear(p.x)}, ${this.formatear(p.y)}) = ${this.formatear(p.k1)}$$<br>
            $$k_2 = f(${this.formatear(p.x)} + \\frac{${this.formatear(r.h)}}{2}, ${this.formatear(p.y)} + \\frac{${this.formatear(r.h)}}{2} \\times ${this.formatear(p.k1)}) = ${this.formatear(p.k2)}$$<br>
            $$k_3 = f(${this.formatear(p.x)} + \\frac{${this.formatear(r.h)}}{2}, ${this.formatear(p.y)} + \\frac{${this.formatear(r.h)}}{2} \\times ${this.formatear(p.k2)}) = ${this.formatear(p.k3)}$$<br>
            $$k_4 = f(${this.formatear(p.x)} + ${this.formatear(r.h)}, ${this.formatear(p.y)} + ${this.formatear(r.h)} \\times ${this.formatear(p.k3)}) = ${this.formatear(p.k4)}$$<br>
            $$y_{${idx + 1}} = ${this.formatear(p.y)} + \\frac{${this.formatear(r.h)}}{6}(${this.formatear(p.k1)} + 2 \\times ${this.formatear(p.k2)} + 2 \\times ${this.formatear(p.k3)} + ${this.formatear(p.k4)}) = ${this.formatear(p_siguiente.y)}$$<br>
            $$x_{${idx + 1}} = ${this.formatear(p.x)} + ${this.formatear(r.h)} = ${this.formatear(p_siguiente.x)}$$
          </p>
        `;
      }
    });

    latex += `
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 4: Tabla Resumen de AproximaciÛn</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>n</th>
              <th>x<sub>n</sub></th>
              <th>y<sub>n</sub></th>
              <th>k<sub>1</sub></th>
              <th>k<sub>2</sub></th>
              <th>k<sub>3</sub></th>
              <th>k<sub>4</sub></th>
              <th>îy</th>
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
          <td>${this.formatear(p.k1)}</td>
          <td>${this.formatear(p.k2)}</td>
          <td>${this.formatear(p.k3)}</td>
          <td>${this.formatear(p.k4)}</td>
          <td>${this.formatear(p.deltaY)}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>

      <div class="resultado-final">
        <strong>SoluciÛn NumÈrica Aproximada:</strong>
        <p>Se han calculado ${r.n} puntos de la soluciÛn aproximada usando el MÈtodo de Runge-Kutta Orden 4 con h = ${this.formatear(r.h)}. Este mÈtodo ofrece una precisiÛn de orden O(hu), lo que lo hace altamente preciso para la mayorÌa de aplicaciones pr·cticas.</p>
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
      name: 'SoluciÛn aproximada',
      line: { color: '#1e40af', width: 2 },
      marker: { size: 6, color: '#dc2626' }
    };

    const titulo = document.getElementById('tituloExperimento').value ||
                   `Runge-Kutta Orden 4: dy/dx = ${r.expresion}`;

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

    Plotly.newPlot('graficoRK4', [traza], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      alert('Primero calcula la soluciÛn');
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
