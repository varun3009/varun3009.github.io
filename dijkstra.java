/******************************************************************************

                            Online Java Compiler.
                Code, Compile, Run and Debug java program online.
Write your code in this editor and press "Run" button to execute it.

*******************************************************************************/
import java.util.*;
public class Main
{
	public static int min(int visited[],int mst[])
    {
        int i=Integer.MAX_VALUE;
        int n=-1;
        for(int j=0;j<visited.length;j++)
        {
            if(visited[j]==0 && mst[j]<i)
            {
                i=mst[j];
                n=j;
            }
        }
        return n;
    }
    public static void prims1(int graph[][],int source)
    {
        int parent[]=new int[graph.length];
        int mst[]=new int[graph.length];
        parent[source]=-1;
        Arrays.fill(mst,Integer.MAX_VALUE);
        mst[source]=0;
        int visited[]=new int[graph.length];
        int i=graph.length-1;
        while(i>0)
        {
            i--;
            int node=min(visited,mst);
            if(node==-1)
                break;
            visited[node]=1;
            for(int j=0;j<graph.length;j++)
            {
                if(graph[node][j]>0&&visited[j]==0 && mst[j]>(mst[node]+graph[node][j]))
                {
                    parent[j]=node;
                    mst[j]=graph[node][j]+mst[node];
                }
            }
        }
        int sum=0;
        for(int j=0;j<mst.length;j++)
        {
            System.out.println( j+"is child of "+parent[j]+" weight is "+mst[j]);
            sum+=mst[j];
        }
        System.out.println(sum);
    } 
    public static void main(String[] args) {
        int graph[][] = new int[][] { { 0, 4, 0, 0, 0, 0, 0, 8, 0 },
                                      { 4, 0, 8, 0, 0, 0, 0, 11, 0 },
                                      { 0, 8, 0, 7, 0, 4, 0, 0, 2 },
                                      { 0, 0, 7, 0, 9, 14, 0, 0, 0 },
                                      { 0, 0, 0, 9, 0, 10, 0, 0, 0 },
                                      { 0, 0, 4, 14, 10, 0, 2, 0, 0 },
                                      { 0, 0, 0, 0, 0, 2, 0, 1, 6 },
                                      { 8, 11, 0, 0, 0, 0, 1, 0, 7 },
                                      { 0, 0, 2, 0, 0, 0, 6, 7, 0 } };
        prims1(graph,0);
    }
}
