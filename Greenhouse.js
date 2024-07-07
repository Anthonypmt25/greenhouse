class GreenhouseClient {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.dataType = this.determineDataType(apiEndpoint);
    }

    determineDataType(apiEndpoint) {
        return apiEndpoint.includes("/departments") ? "departments" :
            apiEndpoint.includes("/jobs") ? "jobs" :
            null;
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

            const data = await response.json();
            if (this.dataType === "departments" && !data.departments) return;
            if (this.dataType === "jobs" && !data.jobs) return;

            this.data = data;
            if (this.dataType === "departments") {
                this.filterDepartments(data.departments);
            } else {
                this.populateJobs(data.jobs);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    filterDepartments(departments) {
        const departmentContainer = document.querySelector("[gw-departments-container]");
        if (!departmentContainer) return;

        const departmentsToShow = departments.filter(department => department.name === "Product Design");

        departmentsToShow.forEach(department => {
            const departmentItem = document.querySelector(`[gw-department-item="${department.name}"]`);
            if (departmentItem) {
                departmentItem.style.display = "";
                this.populateJobs(department.jobs, departmentItem.querySelector("[gw-jobs-container]"));
            }
        });

        const allDepartmentItems = document.querySelectorAll("[gw-departments-item]");
        allDepartmentItems.forEach(item => {
            if (!departmentsToShow.find(department => item.getAttribute("gw-department-item") === department.name)) {
                item.style.display = "none";
            }
        });
    }

    populateJobs(jobs, container = document.querySelector("[gw-jobs-container]")) {
        if (!container) return;

        const jobsItemTemplate = container.querySelector("[gw-jobs-item]");
        if (!jobsItemTemplate) return;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        jobs.forEach(job => {
            const jobItem = jobsItemTemplate.cloneNode(true);
            jobItem.style.display = "";
            jobItem.querySelector("[gw-jobs-title]").textContent = job.title;
            jobItem.querySelector("[gw-jobs-location]").textContent = job.location.name;
            jobItem.querySelector("[gw-jobs-apply]").setAttribute("href", job.absolute_url);
            container.appendChild(jobItem);
        });
    }

    static init(apiEndpoint) {
        const greenhouseClient = new GreenhouseClient(apiEndpoint);
        document.addEventListener("DOMContentLoaded", () => {
            if (greenhouseClient.dataType === "departments" && document.querySelector("[gw-departments-item]")) {
                greenhouseClient.fetchData();
            } else if (greenhouseClient.dataType === "jobs" && document.querySelector("[gw-jobs-item]")) {
                greenhouseClient.fetchData();
            }
        });
    }
}

window.runGreenhouseClient = GreenhouseClient.init;
