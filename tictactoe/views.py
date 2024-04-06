from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'tictactoe/index.html', {})


def sala(request, sala_id):
    return render(request, "tictactoe/sala.html", {"sala_id": sala_id})