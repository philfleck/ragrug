using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneLoader : MonoBehaviour
{
    public int SceneToLoad;

    public void LoadScene()
    {
        SceneManager.LoadScene(SceneToLoad, LoadSceneMode.Single);
    }
}
