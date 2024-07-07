class GreenhouseClient {
  constructor(t) {
    (this.apiEndpoint = t), (this.dataType = this.determineDataType(t));
  }
  determineDataType(t) {
    return t.includes("/departments")
      ? "departments"
      : t.includes("/jobs")
      ? "jobs"
      : null;
  }
  async fetchData() {
    if (!this.apiEndpoint || !this.dataType) return;
    const t = {
      method: "GET",
      redirect: "follow",
      headers: { "Content-Type": "application/json" }
    };
    try {
      const e = await fetch(this.apiEndpoint, t);
      if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
      const n = await e.json();
      if ("departments" === this.dataType && !n.departments) return;
      if ("jobs" === this.dataType && !n.jobs) return;
      (this.data = n),
        "departments" === this.dataType
          ? this.populateDepartments(n.departments)
          : this.populateJobs(n.jobs);
    } catch (t) {}
  }
  populateDepartments(t) {
    const e = document.querySelector("[gw-departments-container]");
    if (!e) return;
    if (!t || 0 === t.length)
      return void (e.textContent = "No departments found.");
    const n = document.querySelector("[gw-departments-item]");
    n &&
      (n.remove(),
      t.forEach((t) => {
        const o = n.cloneNode(!0);
        if (((o.style.display = ""), !t.jobs || 0 === t.jobs.length))
          return void (o.style.display = "none");
        o.setAttribute("gw-department-item", t.name);
        const a = o.querySelector("[gw-departments-quantity]");
        a && (a.textContent = "(" + t.jobs.length + ")");
        const s = o.querySelector("[gw-departments-title]");
        s && (s.textContent = t.name),
          e.appendChild(o),
          t.jobs &&
            t.jobs.length > 0 &&
            this.populateJobs(t.jobs, o.querySelector("[gw-jobs-container]"));
      }));
  }
  populateJobs(t, e = document.querySelector("[gw-jobs-container]")) {
    if (!e) return;
    const n = e.querySelector("[gw-jobs-item]");
    n &&
      (n.remove(),
      t.forEach((t) => {
        const o = n.cloneNode(!0);
        o.style.display = "";
        const a = o.querySelector("[gw-jobs-title]");
        a && (a.textContent = t.title);
        const s = o.querySelector("[gw-jobs-location]");
        s && t.location && (s.textContent = t.location.name);
        const r = o.querySelector("[gw-jobs-apply]");
        r && ((r.href = t.absolute_url), (r.target = "_blank")),
          e.appendChild(o);
      }));
  }
  filterDepartments(t) {
    if (!t) return;
    const e = document.querySelector("[gw-filter-departments]");
    if (e) {
      for (; e.options.length > 1; ) e.remove(1);
      if (0 === e.options.length || "" !== e.options[0].value) {
        const t = new Option("All Departments", "", !0, !0);
        e.add(t, e.options[0]);
      }
      t.forEach((t) => {
        if (t.jobs && t.jobs.length > 0) {
          const n = new Option(t.name, t.name);
          e.add(n);
        }
      }),
        e.addEventListener("change", (t) => {
          const e = t.target.value;
          document.querySelectorAll("[gw-departments-item]").forEach((t) => {
            "" === e || t.getAttribute("gw-department-item") === e
              ? (t.style.display = "")
              : (t.style.display = "none");
          });
        });
    }
  }
  static init(t) {
    const e = new GreenhouseClient(t);
    document.addEventListener("DOMContentLoaded", () => {
      "departments" === e.dataType &&
      document.querySelector("[gw-departments-item]")
        ? e.fetchData().then(() => {
            e.data &&
              e.data.departments &&
              e.filterDepartments(e.data.departments);
          })
        : "jobs" === e.dataType &&
          document.querySelector("[gw-jobs-item]") &&
          e.fetchData();
    });
  }
}
window.runGreenhouseClient = GreenhouseClient.init;
