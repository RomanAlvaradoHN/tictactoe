from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'tictactoe/index.html', {})


def sala(request, nombre_sala):
    return render(request, "tictactoe/sala.html", {"sala_info": nombre_sala})