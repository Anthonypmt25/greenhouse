class GreenhouseClient {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.dataType = this.determineDataType(apiEndpoint);
    }

    determineDataType(apiEndpoint) {
        return apiEndpoint.includes("/departments") ? "departments" : null;
    }

    async fetchData() {
        if (!this.apiEndpoint || !this.dataType) return;

        const requestOptions = {
            method: "GET",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json"
            }
        };

        try {
            const response = await fetch(this.apiEndpoint, requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            if (this.dataType === "departments" && !this.data.departments) {
                return;
            }
            this.populateDepartments(this.data.departments);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    populateDepartments(departments) {
        const container = document.querySelector("[gw-departments-container]");
        if (!container) return;
        
        // Clear existing departments
        container.innerHTML = '';

        if (!departments || departments.length === 0) {
            container.textContent = "No departments found.";
            return;
        }

        departments.forEach(department => {
            const departmentElement = document.createElement('div');
            departmentElement.setAttribute("gw-department-item", department.name);
            departmentElement.textContent = department.name;
            container.appendChild(departmentElement);
        });
    }

    filterDepartments(departments) {
        const filterSelect = document.querySelector("[gw-filter-departments]");
        if (!filterSelect) return;

        // Clear existing options
        filterSelect.innerHTML = '';

        // Add default option
        const defaultOption = new Option("All Departments", "");
        filterSelect.appendChild(defaultOption);

        departments.forEach(department => {
            const option = new Option(department.name, department.name);
            filterSelect.appendChild(option);
        });

        filterSelect.addEventListener("change", (event) => {
            const selectedDepartment = event.target.value;

            document.querySelectorAll("[gw-department-item]").forEach(item => {
                if (selectedDepartment === "" || item.getAttribute("gw-department-item") === selectedDepartment) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }

    static init(apiEndpoint) {
        const client = new GreenhouseClient(apiEndpoint);
        document.addEventListener("DOMContentLoaded", () => {
            if (client.dataType === "departments" && document.querySelector("[gw-departments-container]")) {
                client.fetchData().then(() => {
                    client.data && client.data.departments && client.filterDepartments(client.data.departments);
                });
            }
        });
    }
}

window.runGreenhouseClient = GreenhouseClient.init;
