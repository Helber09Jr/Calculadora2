const App = {
  estado: { resultado: null },

  iniciar() {
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();
  },

  limpiarTodo() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.resultado = null;
      document.getElementById('inputFuncion').value = 'x**2';
      document.getElementById('inputA').value = '0';
      document.getElementById('inputB').value = '1';
      document.getElementById('inputN').value = '10';
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoTrapecio').innerHTML = '';
      document.getElementById('seccionDesarrollo').classList.add('oculto');
      document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      alert('Datos limpiados correctamente');
    }
  },

  evaluarFuncion(expr, x) {
    try {
      return new Function('x', `return ${expr}`)(x);
    } catch (e) {
      throw new Error(`Error en la expresión: ${expr}`);
    }
  },

  validar() {
    const expr = document.getElementById('inputFuncion').value.trim();
    const a = parseFloat(document.getElementById('inputA').value);
    const b = parseFloat(document.getElementById('inputB').value);
    const n = parseInt(document.getElementById('inputN').value);

    if (!expr) throw new Error('Ingrese una función f(x)');
    if (isNaN(a) || isNaN(b)) throw new Error('Los límites deben ser números válidos');
    if (a >= b) throw new Error('El límite inferior debe ser menor que el superior');
    if (isNaN(n) || n < 1) throw new Error('n debe ser al menos 1');

    return { expr, a, b, n };
  },

  calcular() {
    try {
      const { expr, a, b, n } = this.validar();
      const h = (b - a) / n;
      const puntos = [];
      let suma = this.evaluarFuncion(expr, a) + this.evaluarFuncion(expr, b);

      for (let i = 1; i < n; i++) {
        const xi = a + i * h;
        const fxi = this.evaluarFuncion(expr, xi);
        suma += 2 * fxi;
        puntos.push({ x: parseFloat(xi.toFixed(6)), y: parseFloat(fxi.toFixed(6)) });
      }

      puntos.unshift({ x: a, y: this.evaluarFuncion(expr, a) });
      puntos.push({ x: b, y: this.evaluarFuncion(expr, b) });

      const integral = (h / 2) * suma;

      this.estado.resultado = { expr, a, b, n, h, integral, puntos };
      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Integral calculada correctamente: ${this.formatear(integral)}`);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  formatear(n) {
    return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(6)).toString();
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    let html = `
      <p><strong>Función:</strong> f(x) = ${r.expr}</p>
      <p><strong>Límites:</strong> a = ${this.formatear(r.a)}, b = ${this.formatear(r.b)}</p>
      <p style="margin-top: 12px;"><strong>Resultado de la integral:</strong></p>
      <p style="font-size: 1.4em; color: var(--verde-exito);">+ H ${this.formatear(r.integral)}</p>
      <p style="margin-top: 10px; color: var(--gris-texto);">h = ${this.formatear(r.h)}, n = ${r.n} intervalos</p>
    `;
    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    let latex = `
      <div class="paso-desarrollo">
        <h4>Fórmula del Trapecio</h4>
        <p>$$\\int_a^b f(x)dx \\approx \\frac{h}{2}[f(x_0) + 2f(x_1) + 2f(x_2) + ... + 2f(x_{n-1}) + f(x_n)]$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Parámetros</h4>
        <p>h = \\frac{${this.formatear(r.b)} - ${this.formatear(r.a)}}{${r.n}} = ${this.formatear(r.h)}</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Resultado</h4>
        <p>$$\\int_{${this.formatear(r.a)}}^{${this.formatear(r.b)}} ${r.expr} \\, dx \\approx ${this.formatear(r.integral)}$$</p>
      </div>
    `;
    document.getElementById('contenedorDesarrollo').innerHTML = latex;
    window.MathJax && MathJax.typesetPromise();
  },

  graficar() {
    const r = this.estado.resultado;
    const xs = [], ys = [];
    for (let i = 0; i <= 100; i++) {
      const x = r.a + (i / 100) * (r.b - r.a);
      xs.push(x);
      ys.push(this.evaluarFuncion(r.expr, x));
    }

    const layout = {
      title: document.getElementById('tituloExperimento').value || `Integral: f(x) = ${r.expr}`,
      xaxis: { title: 'x', gridcolor: '#e2e8f0' },
      yaxis: { title: 'f(x)', gridcolor: '#e2e8f0' },
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff',
      margin: { l: 60, r: 40, t: 60, b: 40 }
    };

    Plotly.newPlot('graficoTrapecio', [
      { x: xs, y: ys, mode: 'lines', name: `f(x) = ${r.expr}`, line: { color: '#1e40af', width: 2 } },
      { x: r.puntos.map(p => p.x), y: r.puntos.map(p => p.y), mode: 'markers', name: 'Puntos', marker: { size: 5, color: '#dc2626' } }
    ], layout, { responsive: true, displayModeBar: true, displaylogo: false });
  },

  alternarPasos() {
    if (!this.estado.resultado) return alert('Primero calcula la integral');
    const sec = document.getElementById('seccionDesarrollo');
    sec.classList.toggle('oculto');
    document.getElementById('btnTogglePasos').textContent = sec.classList.contains('oculto') ? 'Abrir desarrollo' : 'Ocultar desarrollo';
  },

  alternarMenu() {
    document.getElementById('menuNavegacion').classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('tituloExperimento').value = 'Área bajo la parábola';
    document.getElementById('inputFuncion').value = 'x**2';
    document.getElementById('inputA').value = '0';
    document.getElementById('inputB').value = '1';
    document.getElementById('inputN').value = '10';
    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
