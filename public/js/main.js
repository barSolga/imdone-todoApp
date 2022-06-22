'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    const alerts = document.querySelectorAll('.alert');

    if(alerts != undefined) {
        let delay = 0.05;
        let time = 100;
        alerts.forEach(alert => {
            alert.style.animationDelay = `${0.01+delay}s`;
            delay+= 0.1
        });
    
        $('.closePopup').click(function(){
            $(this).parent(".alert").fadeOut(300);
          });
    
        alerts.forEach(alert => {
            setTimeout(() => {
                $('.alert').fadeOut(300);
            }, 10000);
        });
    }

    if(body.classList.contains('index')) {
        const showPass = document.querySelector('.showPass');
        const showPassTwo = document.querySelector('.showPassTwo');
        const passInput = document.querySelector('#password');
        const passInputTwo = document.querySelector('#passwordTwo');

        function showPassword(e) {
            console.log('hello');
            const icon = document.querySelector('.passIco');
            e.preventDefault();

            if(passInput.getAttribute('type') === 'password') {
                passInput.setAttribute('type', 'text');
                icon.classList.remove('bxs-show');
                icon.classList.add('bxs-hide');
            } else {
                passInput.setAttribute('type', 'password');
                icon.classList.add('bxs-show');
                icon.classList.remove('bxs-hide');
            }
        }

        function showPasswordTwo(e) {
            console.log('hello');
            const icon = document.querySelector('.passIcoTwo');
            e.preventDefault();

            if(passInputTwo.getAttribute('type') === 'password') {
                passInputTwo.setAttribute('type', 'text');
                icon.classList.remove('bxs-show');
                icon.classList.add('bxs-hide');
            } else {
                passInputTwo.setAttribute('type', 'password');
                icon.classList.add('bxs-show');
                icon.classList.remove('bxs-hide');
            }
        }

        showPass.addEventListener('click', showPassword);
        showPassTwo.addEventListener('click', showPasswordTwo);
    } 
    
    if(body.classList.contains('dashboard')) {
        const dateInput = document.querySelector('#start');
        const hideStats = document.querySelector('.checkStats__close');
        const hideAddTask = document.querySelector('.addTaskContainer__close');
        const statsToggle = document.querySelector('.showStats');
        const addTaskToggle = document.querySelector('.addTask');
        const todaysDate = getDate();
        let choosenDate = dateInput.value;
        let storageDate = localStorage.getItem('date');
        let allTasks;



        function toggleStats() {
            const statsCard = document.querySelector('.checkStats');
            statsCard.classList.toggle('active');
            body.classList.toggle('noScroll');
        }

        function toggleAddTask() {
            const addTaskCard = document.querySelector('.addTaskContainer');
            addTaskCard.classList.toggle('active');
            body.classList.toggle('noScroll');
        }

        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }

        function getDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = padTo2Digits(date.getMonth() + 1);
            const day = padTo2Digits(date.getDate());
            const withHyphens = [year, month, day].join('-');
            return withHyphens;
        }
        // ===== functions ======
        function getTasks() {
            allTasks = document.querySelectorAll('.todo__container');
        }

        function comparator(a, b) {
            if (a.dataset.priority < b.dataset.priority)
                return 1;
            if (a.dataset.priority > b.dataset.priority)
                return -1;
            return 0;
        }

        function sortTasks() {
            var indexes = document.querySelectorAll("[data-priority]");
            var indexesArray = Array.from(indexes);
            let sorted = indexesArray.sort(comparator);
            sorted.forEach(e => document.querySelector(".todo").appendChild(e));
        }

        function setDate() {
            const dateInfo = document.querySelector('.currentDate');
            if(choosenDate == '' && storageDate == null) {
                dateInput.setAttribute("value", todaysDate);
                dateInfo.innerHTML = dateInput.value;
            } else {
                dateInput.setAttribute("value", localStorage.getItem('date').toString());
                dateInfo.innerHTML = dateInput.value;
            }
            
        }

        function showTasks() {  
            allTasks.forEach(task => {
                if(!task.getAttribute('data-date').includes(dateInput.value.toString())) {
                    task.remove();
                }
                // set styling for priority
                if(task.getAttribute('data-priority') == '0') {
                    task.classList.add('normal');
                }
                else if(task.getAttribute('data-priority') == '1') {
                    task.classList.add('important');
                }
            });
        }

        function countAllTasks() {
            let all = 0;
            allTasks.forEach(task => {
                if(task.getAttribute('data-date').includes(dateInput.value.toString())) {
                    all+=1
                }
            });
            return all;
        }

        function countUndoneTasks() {
            let undone = 0;
            allTasks.forEach(task => {
                if(!task.classList.contains('done', 'hideTask') && task.getAttribute('data-date').includes(dateInput.value.toString())) {
                    undone+=1
                }
            });
            return undone;
        }

        function countDoneTasks() {
            let done = 0;
            allTasks.forEach(task => {
                if(task.classList.contains('done', 'showTask') && task.getAttribute('data-date').includes(dateInput.value.toString())) {
                    done+=1
                }
            });
            return done;
        }

        function createChart() {
            const percent = document.querySelector('.chartBox__percent');
            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Undone', 'Done'],
                    datasets: [{
                        data: [countUndoneTasks(), countDoneTasks()],
                        backgroundColor: [
                            'rgba(175, 174, 255, 0.5)',
                            'rgba(77, 78, 251, 1)',
                        ],
                        borderColor: [
                            'rgba(175, 174, 255, 0.5)',
                            'rgba(77, 78, 251, 1)',
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    
                }
            });
            percent.innerHTML = `${Math.round((countDoneTasks()/countAllTasks())*100)}%`
        }

        getTasks();
        setDate();
        showTasks();
        sortTasks();
        createChart();

        dateInput.addEventListener('change', () => {
            localStorage.setItem('date', dateInput.value);
            window.location.reload(true);
            showTasks();
            sortTasks();
        });

        statsToggle.addEventListener('click', toggleStats);
        hideStats.addEventListener('click', toggleStats);
        hideAddTask.addEventListener('click', toggleAddTask);
        addTaskToggle.addEventListener('click', toggleAddTask);
    }

})


